const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const { dashboardStats } = require("../controllers/user.controller");

const router = express.Router();

router.get("/stats", protect, dashboardStats);

module.exports = router;
