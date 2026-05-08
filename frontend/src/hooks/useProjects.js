import { useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "../api/project.api";

export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: getProjectsApi,
  });
