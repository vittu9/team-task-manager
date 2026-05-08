const express = require("express");
const { body } = require("express-validator");
const { signup, login, refresh, logout, me } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

const passwordRule = body("password")
  .isLength({ min: 8 })
  .matches(/[a-z]/)
  .matches(/[A-Z]/)
  .matches(/\d/);

router.post(
  "/signup",
  [
    body("name").isLength({ min: 2, max: 50 }),
    body("email").isEmail(),
    passwordRule,
    body("role").optional().isIn(["ADMIN", "MEMBER", "admin", "member"]),
    validate,
  ],
  signup
);

router.post("/login", [body("email").isEmail(), body("password").notEmpty(), validate], login);
router.post("/refresh", [body("refreshToken").notEmpty(), validate], refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;
