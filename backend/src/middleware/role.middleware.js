const requireRole = (...roles) => (req, res, next) => {
  const normalizedRoles = roles.map((role) => String(role).toUpperCase());
  const userRole = String(req.user?.role || "").toUpperCase();
  if (!normalizedRoles.includes(userRole)) {
    return res.status(403).json({ message: "Access denied: insufficient permissions" });
  }
  next();
};

const authorizeRoles = (...roles) => requireRole(...roles);

module.exports = { requireRole, authorizeRoles };
