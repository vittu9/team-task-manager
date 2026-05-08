import api from "./axios";

export const getProjectTasksApi = (projectId) =>
  api.get(`/tasks/project/${projectId}`).then((r) => r.data);
export const getMyTasksApi = () => api.get("/tasks/my").then((r) => r.data);
export const createTaskApi = (projectId, payload) =>
  api.post(`/tasks/project/${projectId}`, payload).then((r) => r.data);
export const getTaskApi = (id) => api.get(`/tasks/${id}`).then((r) => r.data);
export const updateTaskApi = (id, payload) => api.put(`/tasks/${id}`, payload).then((r) => r.data);
export const updateTaskStatusApi = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data);
export const deleteTaskApi = (id) => api.delete(`/tasks/${id}`).then((r) => r.data);
export const uploadTaskFilesApi = (id, formData) =>
  api.post(`/tasks/${id}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then((r) => r.data);
