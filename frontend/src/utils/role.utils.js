export const normalizeRole = (role) => String(role || "").toUpperCase();

export const isAdminRole = (role) => normalizeRole(role) === "ADMIN";

export const isMemberRole = (role) => normalizeRole(role) === "MEMBER";
