const User = require("../models/User.model");
const { generateTokens, verifyToken } = require("../utils/jwt.utils");

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const user = await User.create({ name, email, password, role: role || "MEMBER" });
  const tokens = generateTokens(user._id.toString());
  return res.status(201).json({ user, ...tokens });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const tokens = generateTokens(user._id.toString());
  return res.status(200).json({ user, ...tokens });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });
  const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) return res.status(401).json({ message: "User not found" });
  const { accessToken } = generateTokens(user._id.toString());
  return res.status(200).json({ accessToken });
};

const logout = async (req, res) => {
  return res.status(200).json({ message: "Logged out" });
};

const me = async (req, res) => res.status(200).json(req.user);

module.exports = { signup, login, refresh, logout, me };
