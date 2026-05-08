const Project = require("../models/Project.model");
const Task = require("../models/Task.model");
const User = require("../models/User.model");

const isProjectAdmin = (project, userId) =>
  project.members.some(
    (m) => m.user.toString() === userId.toString() && m.role === "ADMIN"
  );

const listProjects = async (req, res) => {
  const projects = await Project.find({ "members.user": req.user._id })
    .populate("members.user", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
  res.json(projects);
};

const createProject = async (req, res) => {
  try {
    const { name, description, deadline, assignedUsers = [], files = [] } = req.body;
    
    // Create project with admin as member
    const project = await Project.create({
      name,
      description,
      deadline,
      createdBy: req.user._id,
      members: [
        { user: req.user._id, role: "ADMIN" },
        ...assignedUsers.map(userId => ({
          user: userId,
          role: "MEMBER",
          permissions: {
            canViewTasks: true,
            canCreateTasks: false,
            canAssignTasks: false,
            canViewAnalytics: false,
            canManageMembers: false
          }
        }))
      ]
    });

    // Create default tasks for assigned users
    if (assignedUsers.length > 0) {
      const defaultTasks = assignedUsers.map(userId => ({
        title: `Welcome to ${name} project`,
        description: `You have been assigned to the ${name} project. Please review the project details and start working on your assigned tasks. This task will appear in your profile dashboard.`,
        priority: "MEDIUM",
        status: "TODO",
        project: project._id,
        assignedTo: userId,
        createdBy: req.user._id,
        dueDate: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const createdTasks = await Task.insertMany(defaultTasks);
      
      // Update user profiles with task assignments
      await User.updateMany(
        { _id: { $in: assignedUsers } },
        { 
          $push: { 
            assignedTasks: createdTasks.map(task => task._id),
            recentProjects: project._id 
          }
        }
      );

      console.log(`Created ${createdTasks.length} tasks for ${assignedUsers.length} users`);
    }

    // Store project files (simplified - in production, use cloud storage)
    project.files = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size || 0,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    }));

    await project.save();
    res.status(201).json({ 
      message: "Project created successfully",
      project: {
        ...project.toObject(),
        tasksCreated: assignedUsers.length
      }
    });
  } catch (error) {
    console.error("Project creation error:", error);
    res.status(500).json({ message: "Failed to create project", error: error.message });
  }
};

const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("members.user", "name email role")
    .populate("createdBy", "name email role");
  if (!project) return res.status(404).json({ message: "Project not found" });
  const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
  if (!isMember) return res.status(403).json({ message: "Not a project member" });
  const tasksCount = await Task.countDocuments({ project: project._id });
  res.json({ ...project.toObject(), tasksCount });
};

const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!isProjectAdmin(project, req.user._id)) return res.status(403).json({ message: "Only project admin can update" });
  Object.assign(project, req.body);
  await project.save();
  res.json(project);
};

const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!isProjectAdmin(project, req.user._id)) return res.status(403).json({ message: "Only project admin can delete" });
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: "Project deleted" });
};

const addMember = async (req, res) => {
  const { email, role = "MEMBER" } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!isProjectAdmin(project, req.user._id)) return res.status(403).json({ message: "Only project admin can add members" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (project.members.some((m) => m.user.toString() === user._id.toString())) {
    return res.status(409).json({ message: "User is already a member" });
  }
  project.members.push({ user: user._id, role });
  await project.save();
  res.json(project);
};

const removeMember = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!isProjectAdmin(project, req.user._id)) return res.status(403).json({ message: "Only project admin can remove members" });
  project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
  await project.save();
  res.json(project);
};

const updateMemberRole = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (!isProjectAdmin(project, req.user._id)) return res.status(403).json({ message: "Only project admin can update roles" });
  const member = project.members.find((m) => m.user.toString() === req.params.userId);
  if (!member) return res.status(404).json({ message: "Member not found" });
  member.role = req.body.role;
  await project.save();
  res.json(project);
};

module.exports = {
  listProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
};
