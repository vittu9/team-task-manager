import api from "./axios";

export const listUsersApi = () => api.get("/users/members").then((r) => r.data);
export const updateUserRoleApi = (id, role) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data);
