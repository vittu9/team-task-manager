const User = require("../models/User.model");
const Project = require("../models/Project.model");
const Task = require("../models/Task.model");

const listUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

const updateProfile = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name },
    { new: true, runValidators: true }
  ).select("-password");
  res.json(user);
};

const updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  ).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

const dashboardStats = async (req, res) => {
  const memberProjects = await Project.find({ "members.user": req.user._id }).select("_id name createdAt");
  const projectIds = memberProjects.map((p) => p._id);
  const [totalTasks, completedTasks, overdueTasks, myTasksDueSoon, statusAgg] = await Promise.all([
    Task.countDocuments({ project: { $in: projectIds } }),
    Task.countDocuments({ project: { $in: projectIds }, status: "DONE" }),
    Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: "DONE" },
    }),
    Task.find({
      assignedTo: req.user._id,
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: "DONE" },
    })
      .populate("project", "name")
      .sort({ dueDate: 1 })
      .limit(5),
    Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
  statusAgg.forEach((s) => {
    tasksByStatus[s._id] = s.count;
  });

  const recentProjects = [...memberProjects]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  res.json({
    totalProjects: memberProjects.length,
    totalTasks,
    completedTasks,
    overdueTasks,
    tasksByStatus,
    myTasksDueSoon,
    recentProjects,
  });
};

// Admin-only: Get all members with their details
const getAllMembers = async (req, res) => {
  // Only admins can access member list
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Only admins can view member list" });
  }

  try {
    // Get all members
    const allMembers = await User.find({ role: 'MEMBER' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get task statistics for each member
    const membersWithStats = await Promise.all(
      allMembers.map(async (member) => {
        const [assignedTasks, completedTasks, overdueTasks] = await Promise.all([
          Task.countDocuments({ assignedTo: member._id }),
          Task.countDocuments({ assignedTo: member._id, status: 'DONE' }),
          Task.countDocuments({
            assignedTo: member._id,
            dueDate: { $lt: new Date() },
            status: { $ne: 'DONE' }
          })
        ]);

        const completionRate = assignedTasks > 0 ? (completedTasks / assignedTasks * 100).toFixed(1) : 0;

        return {
          ...member.toObject(),
          stats: {
            tasksAssigned: assignedTasks,
            completed: completedTasks,
            overdue: overdueTasks,
            completionRate: parseFloat(completionRate)
          }
        };
      })
    );

    const memberStats = {
      total: allMembers.length,
      active: membersWithStats.filter(m => m.stats.tasksAssigned > 0).length,
      inactive: membersWithStats.filter(m => m.stats.tasksAssigned === 0).length,
      withOverdueTasks: membersWithStats.filter(m => m.stats.overdue > 0).length
    };

    res.json({
      members: membersWithStats,
      stats: memberStats,
      message: `Found ${allMembers.length} members (${memberStats.active} active, ${memberStats.inactive} inactive)`
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Failed to fetch members", error: error.message });
  }
};

// Admin-only: Get member details
const getMemberDetails = async (req, res) => {
  // Only admins can access member details
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Only admins can view member details" });
  }

  try {
    const member = await User.findOne({ _id: req.params.id, role: 'MEMBER' })
      .select('-password');

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Get task statistics for this member
    const [assignedTasks, completedTasks, overdueTasks, recentTaskList] = await Promise.all([
      Task.countDocuments({ assignedTo: member._id }),
      Task.countDocuments({ assignedTo: member._id, status: 'DONE' }),
      Task.countDocuments({
        assignedTo: member._id,
        dueDate: { $lt: new Date() },
        status: { $ne: 'DONE' }
      }),
      Task.find({ assignedTo: member._id })
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const completionRate = assignedTasks > 0 ? (completedTasks / assignedTasks * 100).toFixed(1) : 0;

    res.json({
      member: {
        ...member.toObject(),
        performance: {
          totalTasks: assignedTasks,
          completedTasks,
          overdueTasks,
          completionRate: parseFloat(completionRate),
          averageCompletionTime: completionRate > 0 ? 'Good' : 'N/A'
        },
        recentTasks: recentTaskList
      }
    });
  } catch (error) {
    console.error("Error fetching member details:", error);
    res.status(500).json({ message: "Failed to fetch member details", error: error.message });
  }
};

module.exports = { listUsers, updateProfile, updateUserRole, dashboardStats, getAllMembers, getMemberDetails };
