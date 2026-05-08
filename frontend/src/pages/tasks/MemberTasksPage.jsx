import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import PageWrapper from "../../components/layout/PageWrapper";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { getMyTasksApi, updateTaskStatusApi } from "../../api/task.api";
import { useAuthStore } from "../../store/authStore";

const STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export default function MemberTasksPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["member-tasks"],
    queryFn: getMyTasksApi,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => updateTaskStatusApi(id, status),
    onSuccess: () => {
      toast.success("Task status updated");
      queryClient.invalidateQueries({ queryKey: ["member-tasks"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'IN_REVIEW': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'DONE').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    overdue: tasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.status !== 'DONE').length
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'overdue') return task.dueDate && isOverdue(task.dueDate) && task.status !== 'DONE';
    return task.status === selectedFilter;
  });

  return (
    <PageWrapper>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Tasks</h1>
          <div className="text-sm text-slate-600">
            Welcome back, {user?.name}! You have {taskStats.total} task{taskStats.total !== 1 ? 's' : ''} assigned.
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-900">{taskStats.total}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-slate-500">To Do</p>
            <p className="text-2xl font-bold text-yellow-600">{taskStats.todo}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-slate-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
          </div>
        </div>

        {/* Task Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            {['all', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'overdue'].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All' : 
                 filter === 'overdue' ? 'Overdue' :
                 filter.replace('_', ' ')}
                {filter !== 'all' && (
                  <span className="ml-1">
                    ({filter === 'overdue' ? taskStats.overdue : 
                      tasks.filter(t => t.status === filter).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-slate-500">Loading your tasks...</p>
          </div>
        )}

        {!isLoading && filteredTasks.length === 0 && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v2a2 2 0 012 2h2a2 2 0 012-2V7a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {selectedFilter === 'all' ? 'No tasks assigned yet' : `No ${selectedFilter.replace('_', ' ')} tasks`}
            </h3>
            <p className="text-slate-600 mb-4">
              {selectedFilter === 'all' 
                ? 'Your admin hasn\'t assigned any tasks to you yet. Check back later!'
                : `You don't have any ${selectedFilter.replace('_', ' ')} tasks.`
              }
            </p>
            <Button onClick={() => window.location.href = '/projects'}>
              View Projects
            </Button>
          </div>
        )}

        {!isLoading && filteredTasks.length > 0 && (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Link
                key={task._id}
                to={`/member/tasks/${task._id}`}
                className="block rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow hover:border-blue-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.dueDate && (
                        <span className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                          {isOverdue(task.dueDate) ? 'OVERDUE' : `Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                        </span>
                      )}
                      {task.files && task.files.length > 0 && (
                        <span className="text-xs text-blue-600">
                          📎 {task.files.length} file{task.files.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.project && (
                    <Badge value={task.project.name} />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    {task.project?.name && `Project: ${task.project.name}`}
                    {task.dueDate && ` • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateStatus.mutate({ id: task._id, status: e.target.value });
                      }}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {task.status !== 'DONE' && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Quick actions:</p>
                    <div className="flex gap-2">
                      {task.status === 'TODO' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus.mutate({ id: task._id, status: 'IN_PROGRESS' });
                          }}
                          disabled={updateStatus.isPending}
                        >
                          Start Working
                        </Button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus.mutate({ id: task._id, status: 'IN_REVIEW' });
                          }}
                          disabled={updateStatus.isPending}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/member/tasks/${task._id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
