import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import PageWrapper from "../../components/layout/PageWrapper";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { isAdminRole } from "../../utils/role.utils";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/dashboard/stats").then((r) => r.data),
  });

  const chartData = Object.entries(data?.tasksByStatus || {}).map(([status, value]) => ({ status, value }));
  const cards = [
    { label: "Total Projects", value: data?.totalProjects || 0 },
    { label: "Total Tasks", value: data?.totalTasks || 0 },
    { label: "Completed", value: data?.completedTasks || 0 },
    { label: "In Progress", value: data?.inProgressTasks || 0 },
    { label: "Overdue", value: data?.overdueTasks || 0 },
  ];

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Welcome back, {user?.name || "User"}</h1>
          <Badge value={user?.role || "MEMBER"} />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-lg bg-white p-4 shadow-sm border">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>
        {isAdminRole(user?.role) ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-3 font-semibold">Admin Quick Actions</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                <Link to="/projects/new">
                  <Button className="w-full">Create Project</Button>
                </Link>
                <Link to="/projects">
                  <Button variant="secondary" className="w-full">View Projects</Button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-3 font-semibold">Recent Activity</h2>
              <div className="space-y-2">
                {(data?.recentActivity || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No recent activity.</p>
                ) : (
                  data.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-slate-600"> {activity.action}</span>
                      </div>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-2 font-semibold">Student Workspace</h2>
            <p className="mb-3 text-sm text-slate-600">
              View and manage your assigned tasks and track your progress.
            </p>
            <div className="mb-3 flex gap-2">
              <Link to="/member/tasks">
                <Button>My Tasks</Button>
              </Link>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tasks Due Soon</h3>
              {(data?.myTasksDueSoon || []).length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming assigned tasks.</p>
              ) : (
                data.myTasksDueSoon.map((task) => (
                  <div key={task._id} className="rounded border p-2 text-sm">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-slate-600">{task.project?.name || "No project"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        <div className="rounded-lg bg-white border p-4">
          <h2 className="mb-3 font-semibold">Tasks By Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
