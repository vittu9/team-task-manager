const express = require("express");
const { body, param } = require("express-validator");
const {
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
} = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();
router.use(protect);

router.get("/my", getMyTasks);
router.get("/", authorizeRoles("ADMIN"), getTasks);
router.post(
  "/project/:projectId",
  authorizeRoles("ADMIN"),
  [
    param("projectId").isMongoId(),
    body("title").isLength({ min: 3, max: 200 }),
    body("description").optional().isLength({ max: 1000 }),
    body("dueDate").optional().isISO8601(),
    body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    body("status").optional().isIn(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
    body("assignedTo").optional({ nullable: true, checkFalsy: true }).isMongoId(),
    validate,
  ],
  createTask
);
router.get("/project/:projectId", [param("projectId").isMongoId(), validate], getTasksByProject);
router.get("/:id", [param("id").isMongoId(), validate], getTaskById);
router.put("/:id", [authorizeRoles("ADMIN"), param("id").isMongoId(), validate], updateTask);
router.patch(
  "/:id/status",
  [authorizeRoles("ADMIN", "MEMBER"), param("id").isMongoId(), body("status").isIn(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]), validate],
  updateTaskStatus
);
router.post("/:id/files", [param("id").isMongoId(), validate], uploadTaskFiles);
router.delete("/:id", [authorizeRoles("ADMIN"), param("id").isMongoId(), validate], deleteTask);

// Bulk assignment and analytics routes
router.post(
  "/bulk-assign/project/:projectId",
  authorizeRoles("ADMIN"),
  [
    param("projectId").isMongoId(),
    body("taskData.title").isLength({ min: 3, max: 200 }),
    body("taskData.description").optional().isLength({ max: 1000 }),
    body("taskData.dueDate").optional().isISO8601(),
    body("taskData.priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    body("assignedUsers").isArray({ min: 1 }),
    body("assignedUsers.*").isMongoId(),
    validate,
  ],
  bulkAssignTasks
);

router.get(
  "/analytics/project/:projectId",
  authorizeRoles("ADMIN"),
  [param("projectId").isMongoId(), validate],
  getTaskAnalytics
);

module.exports = router;
