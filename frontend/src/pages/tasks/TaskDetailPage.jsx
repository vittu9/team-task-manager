import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "../../components/layout/PageWrapper";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { deleteTaskApi, getTaskApi, updateTaskApi } from "../../api/task.api";
import { useAuthStore } from "../../store/authStore";

export default function TaskDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore((s) => s.isAuthenticated);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <PageWrapper>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view task details.</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </PageWrapper>
    );
  }

  const { data: task, isLoading, error } = useQuery({ 
    queryKey: ["task", id], 
    queryFn: () => getTaskApi(id),
    retry: 1,
    enabled: isAuthenticated // Only fetch when authenticated
  });
  const updateTask = useMutation({
    mutationFn: (payload) => updateTaskApi(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task", id] }),
  });
  const removeTask = useMutation({
    mutationFn: () => deleteTaskApi(id),
    onSuccess: () => navigate("/projects"),
  });

  if (isLoading) return <PageWrapper><div className="p-6">Loading...</div></PageWrapper>;
  if (error) return <PageWrapper><div className="p-6">Error loading task: {error.message}</div></PageWrapper>;
  if (!task) return <PageWrapper><div className="p-6">Task not found</div></PageWrapper>;

  return (
    <PageWrapper>
      <div className="max-w-2xl p-6 space-y-3">
        <h1 className="text-2xl font-semibold">Task Details</h1>
        <Input defaultValue={task.title} onBlur={(e) => updateTask.mutate({ title: e.target.value })} />
        <label className="block">
          <span className="mb-1 block text-sm">Description</span>
          <textarea
            defaultValue={task.description}
            onBlur={(e) => updateTask.mutate({ description: e.target.value })}
            className="w-full rounded border p-2"
            rows={5}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select defaultValue={task.status} onChange={(e) => updateTask.mutate({ status: e.target.value })} className="rounded border p-2">
            <option value="TODO">TODO</option><option value="IN_PROGRESS">IN_PROGRESS</option><option value="IN_REVIEW">IN_REVIEW</option><option value="DONE">DONE</option>
          </select>
          <select defaultValue={task.priority} onChange={(e) => updateTask.mutate({ priority: e.target.value })} className="rounded border p-2">
            <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="URGENT">URGENT</option>
          </select>
        </div>
        <Button variant="danger" onClick={() => removeTask.mutate()} loading={removeTask.isPending}>Delete Task</Button>
      </div>
    </PageWrapper>
  );
}
