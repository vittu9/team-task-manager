import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { normalizeRole } from "../../utils/role.utils";

const links = [
  { to: "/dashboard", label: "Dashboard", roles: ["ADMIN", "MEMBER"] },
  { to: "/projects", label: "Projects", roles: ["ADMIN", "MEMBER"] },
  { to: "/member/tasks", label: "My Tasks", roles: ["MEMBER"] },
  { to: "/admin", label: "Admin", roles: ["ADMIN"] },
  { to: "/admin/members", label: "Member Management", roles: ["ADMIN"] },
];

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const visibleLinks = links.filter((l) => l.roles.includes(normalizeRole(user?.role)));
  return (
    <aside className="hidden w-56 border-r bg-white p-4 md:block">
      <h2 className="mb-4 text-lg font-semibold">Project Manager</h2>
      <nav className="space-y-1">
        {visibleLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`block rounded px-3 py-2 text-sm ${location.pathname.startsWith(l.to) ? "bg-blue-100 text-blue-700" : "text-slate-700 hover:bg-slate-100"}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
