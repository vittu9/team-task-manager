const express = require("express");
const { body, param } = require("express-validator");
const {
  listProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} = require("../controllers/project.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();
router.use(protect);

router.get("/", listProjects);
router.post(
  "/",
  authorizeRoles("ADMIN"),
  [
    body("name").isLength({ min: 3, max: 100 }),
    body("description").optional().isLength({ max: 500 }),
    body("deadline").optional().isISO8601(),
    validate,
  ],
  createProject
);
router.get("/:id", [param("id").isMongoId(), validate], getProjectById);
router.put("/:id", [authorizeRoles("ADMIN"), param("id").isMongoId(), validate], updateProject);
router.delete("/:id", [authorizeRoles("ADMIN"), param("id").isMongoId(), validate], deleteProject);
router.post("/:id/members", [authorizeRoles("ADMIN"), param("id").isMongoId(), body("email").isEmail(), validate], addMember);
router.delete("/:id/members/:userId", [authorizeRoles("ADMIN"), param("id").isMongoId(), param("userId").isMongoId(), validate], removeMember);
router.patch(
  "/:id/members/:userId/role",
  [authorizeRoles("ADMIN"), param("id").isMongoId(), param("userId").isMongoId(), body("role").isIn(["ADMIN", "MEMBER"]), validate],
  updateMemberRole
);

module.exports = router;
