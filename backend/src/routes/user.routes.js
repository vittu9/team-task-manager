const express = require("express");
const { body, param } = require("express-validator");
const {
  listUsers,
  updateProfile,
  updateUserRole,
  dashboardStats,
  getAllMembers,
  getMemberDetails,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");

const router = express.Router();
router.use(protect);

router.get("/", requireRole("ADMIN"), listUsers);
router.put("/profile", [body("name").isLength({ min: 2, max: 50 }), validate], updateProfile);
router.patch(
  "/:id/role",
  [requireRole("ADMIN"), param("id").isMongoId(), body("role").isIn(["ADMIN", "MEMBER"]), validate],
  updateUserRole
);
router.get("/dashboard/stats", dashboardStats);
router.get("/members", requireRole("ADMIN"), getAllMembers);
router.get("/members/:id", requireRole("ADMIN"), getMemberDetails);

module.exports = router;
