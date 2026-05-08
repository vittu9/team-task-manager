import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageWrapper from "../../components/layout/PageWrapper";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import KanbanBoard from "../../components/shared/KanbanBoard";
import BulkAssignment from "../../components/BulkAssignment";
import {
  addMemberApi,
  getProjectApi,
  removeMemberApi,
  updateMemberRoleApi,
} from "../../api/project.api";
import { createTaskApi, getProjectTasksApi, updateTaskStatusApi } from "../../api/task.api";
import { useAuthStore } from "../../store/authStore";
import { isAdminRole, normalizeRole } from "../../utils/role.utils";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState("TASKS");
  const [open, setOpen] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const { data: project } = useQuery({ queryKey: ["project", id], queryFn: () => getProjectApi(id) });
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks", id], queryFn: () => getProjectTasksApi(id) });

  const isProjectAdmin = project?.members?.some(
    (m) => m.user?._id === user?._id && isAdminRole(m.role)
  );
  const memberOptions = (project?.members || []).filter((m) => m.user); // Include all members for assignment

  const createTask = useMutation({
    mutationFn: () =>
      createTaskApi(id, {
        title: taskTitle,
        description: "Task created by admin",
        priority: "MEDIUM",
        assignedTo: taskAssignee || user._id, // Assign to admin if no one selected
      }),
    onSuccess: () => {
      setOpen(false);
      setTaskTitle("");
      setTaskAssignee("");
      qc.invalidateQueries({ queryKey: ["tasks", id] });
      toast.success("Task created successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create task"),
  });
  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatusApi(taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", id] }),
  });
  const addMember = useMutation({
    mutationFn: () => addMemberApi(id, { email: inviteEmail }),
    onSuccess: () => {
      setInviteEmail("");
      qc.invalidateQueries({ queryKey: ["project", id] });
    },
  });

  return (
    <PageWrapper>
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{project?.name}</h1>
            <p className="text-slate-600">{project?.description}</p>
          </div>
          <Badge value={project?.status || "ACTIVE"} />
        </div>
        <div className="flex gap-2">
          {["TASKS", "MEMBERS", "SETTINGS"].map((t) => (
            <Button key={t} variant={tab === t ? "primary" : "secondary"} onClick={() => setTab(t)}>
              {t}
            </Button>
          ))}
        </div>

        {/* Educational Features - Admin Only */}
        {isAdminRole(user?.role) && (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="secondary" 
              onClick={() => setBulkAssignOpen(true)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Bulk Assign Tasks
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate(`/projects/${id}/analytics`)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analytics
            </Button>
          </div>
        )}

        {tab === "TASKS" && (
          <div className="space-y-3">
            {isAdminRole(user?.role) ? (
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Tasks</h3>
                <Button onClick={() => setOpen(true)}>Add Task</Button>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Only admins can create and assign tasks.</p>
            )}
            <KanbanBoard tasks={tasks} onStatusChange={(task, status) => updateStatus.mutate({ taskId: task._id, status })} />
          </div>
        )}
        {tab === "MEMBERS" && (
          <div className="rounded-lg border bg-white p-4 space-y-3">
            {project?.members?.map((m) => (
              <div key={m.user._id} className="flex items-center justify-between border-b pb-2">
                <div>{m.user.name} ({m.user.email})</div>
                <div className="flex items-center gap-2">
                  <Badge value={m.role} />
                  {isProjectAdmin && (
                    <>
                      <select
                        className="rounded border px-2 py-1 text-sm"
                        value={m.role}
                        onChange={(e) =>
                          updateMemberRoleApi(id, m.user._id, e.target.value).then(() =>
                            qc.invalidateQueries({ queryKey: ["project", id] })
                          )
                        }
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MEMBER">MEMBER</option>
                      </select>
                      <Button variant="danger" size="sm" onClick={() => removeMemberApi(id, m.user._id).then(() => qc.invalidateQueries({ queryKey: ["project", id] }))}>
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {isProjectAdmin && (
              <div className="flex gap-2">
                <Input placeholder="Invite by email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <Button onClick={() => addMember.mutate()}>Add Member</Button>
              </div>
            )}
          </div>
        )}
        {tab === "SETTINGS" && (
          <div className="rounded-lg border bg-white p-4">
            {isProjectAdmin ? "Project settings form / danger zone goes here." : "Only project admins can view settings."}
          </div>
        )}
      </div>

      <Modal open={open} title="Create New Task" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title *
            </label>
            <Input 
              value={taskTitle} 
              onChange={(e) => setTaskTitle(e.target.value)} 
              placeholder="Enter task title..." 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign to
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
            >
              <option value="">Select team member...</option>
              {memberOptions.map((member) => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.name} ({member.user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-slate-600">
            <p>💡 Task will be created with:</p>
            <ul className="mt-1 ml-4 list-disc">
              <li>Default priority: MEDIUM</li>
              <li>Status: TODO</li>
              <li>Auto-assignment to selected member</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => createTask.mutate()}
            loading={createTask.isPending}
            disabled={taskTitle.trim().length < 3}
          >
            Create Task
          </Button>
        </div>
      </Modal>

      {/* Bulk Assignment Modal */}
      <Modal 
        open={bulkAssignOpen} 
        title="Bulk Assign Tasks" 
        onClose={() => setBulkAssignOpen(false)}
        size="large"
      >
        <BulkAssignment 
          projectId={id}
          onAssignmentComplete={() => {
            setBulkAssignOpen(false);
            qc.invalidateQueries({ queryKey: ["tasks", id] });
          }}
        />
      </Modal>
    </PageWrapper>
  );
}
