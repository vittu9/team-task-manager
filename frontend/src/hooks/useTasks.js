import { useQuery } from "@tanstack/react-query";
import { getProjectTasksApi } from "../api/task.api";

export const useTasks = (projectId) =>
  useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getProjectTasksApi(projectId),
    enabled: Boolean(projectId),
  });
