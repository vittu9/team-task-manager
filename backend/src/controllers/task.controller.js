const Task = require("../models/Task.model");
const Project = require("../models/Project.model");

const isProjectAdmin = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString() && m.role === "ADMIN");

const isProjectMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString());

const isAdmin = (user) => user.role === "ADMIN";

const getMyTasks = async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate("project", "name status")
    .populate("assignedTo", "name email")
    .sort({ dueDate: 1 });
  res.json(tasks);
};

const createTask = async (req, res) => {
  // Only ADMIN can create tasks
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Only ADMIN can create tasks" });
  }
  
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  
  const { assignedTo } = req.body;
  // Admin must assign task to a specific member
  if (!assignedTo) {
    return res.status(400).json({ message: "ADMIN must assign task to a specific member" });
  }
  
  if (!isProjectMember(project, assignedTo)) {
    return res.status(400).json({ message: "Assigned user must be a project member" });
  }
  
  const task = await Task.create({
    ...req.body,
    assignedTo: assignedTo,
    project: project._id,
    createdBy: req.user._id,
  });
  res.status(201).json(task);
};

const getTasksByProject = async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  
  // Members can only see their assigned tasks, Admins can see all tasks
  let taskQuery = { project: project._id };
  if (!isAdmin(req.user)) {
    taskQuery.assignedTo = req.user._id;
  }
  
  const tasks = await Task.find(taskQuery)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
  res.json(tasks);
};

const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("project")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  // Members can only access their assigned tasks, Admins can access any task
  const assignedUserId = task.assignedTo ? task.assignedTo._id : task.assignedTo;
  if (!isAdmin(req.user) && assignedUserId && assignedUserId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only access your assigned tasks" });
  }
  
  res.json(task);
};

const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  const project = await Project.findById(task.project);
  const allowed = task.createdBy.toString() === req.user._id.toString() || isProjectAdmin(project, req.user._id);
  if (!allowed) return res.status(403).json({ message: "Not allowed" });
  Object.assign(task, req.body);
  await task.save();
  res.json(task);
};

const updateTaskStatus = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  // Only the assigned member can update their task status, or Admin can update any task
  const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
  if (!isAssignee && !isAdmin(req.user)) {
    return res.status(403).json({ message: "Only assigned member or ADMIN can update task status" });
  }
  
  task.status = req.body.status;
  await task.save();
  res.json(task);
};

const deleteTask = async (req, res) => {
  // Only ADMIN can delete tasks
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Only ADMIN can delete tasks" });
  }
  
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  await task.deleteOne();
  res.json({ message: "Task deleted" });
};

const getTasks = async (req, res) => {
  // Only ADMIN can see all tasks
  if (!isAdmin(req.user)) {
    return res.status(403).json({ message: "Only ADMIN can view all tasks" });
  }
  
  const tasks = await Task.find()
    .populate("project", "name status")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
  res.json(tasks);
};

const uploadTaskFiles = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  
  // Only assigned member or ADMIN can upload files
  const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
  if (!isAssignee && !isAdmin(req.user)) {
    return res.status(403).json({ message: "Only assigned member or ADMIN can upload files" });
  }
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  
  const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
  task.files = [...(task.files || []), ...fileUrls];
  await task.save();
  
  res.json({ message: "Files uploaded successfully", files: fileUrls });
};

const bulkAssignTasks = async (req, res) => {
  const { taskData, assignedUsers } = req.body;
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  
  const tasks = [];
  for (const userId of assignedUsers) {
    if (!isProjectMember(project, userId)) {
      return res.status(400).json({ message: `User ${userId} is not a project member` });
    }
    
    const task = await Task.create({
      ...taskData,
      assignedTo: userId,
      project: project._id,
      createdBy: req.user._id,
    });
    tasks.push(task);
  }
  
  res.status(201).json(tasks);
};

const getTaskAnalytics = async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  
  const analytics = await Task.aggregate([
    { $match: { project: project._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  
  const statusCounts = analytics.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  res.json({
    total: await Task.countDocuments({ project: project._id }),
    byStatus: statusCounts,
  });
};

module.exports = {
  getMyTasks,
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasks,
  uploadTaskFiles,
  bulkAssignTasks,
  getTaskAnalytics,
};
