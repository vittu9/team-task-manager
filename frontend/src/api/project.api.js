import api from "./axios";

export const getProjectsApi = () => api.get("/projects").then((r) => r.data);
export const createProjectApi = (payload) => api.post("/projects", payload).then((r) => r.data);
export const getProjectApi = (id) => api.get(`/projects/${id}`).then((r) => r.data);
export const updateProjectApi = (id, payload) => api.put(`/projects/${id}`, payload).then((r) => r.data);
export const deleteProjectApi = (id) => api.delete(`/projects/${id}`).then((r) => r.data);
export const addMemberApi = (id, payload) => api.post(`/projects/${id}/members`, payload).then((r) => r.data);
export const removeMemberApi = (id, userId) => api.delete(`/projects/${id}/members/${userId}`).then((r) => r.data);
export const updateMemberRoleApi = (id, userId, role) =>
  api.patch(`/projects/${id}/members/${userId}/role`, { role }).then((r) => r.data);
