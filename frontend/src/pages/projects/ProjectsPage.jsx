import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useProjects } from "../../hooks/useProjects";
import { useAuthStore } from "../../store/authStore";
import PageWrapper from "../../components/layout/PageWrapper";
import ProjectCard from "../../components/shared/ProjectCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { isAdminRole } from "../../utils/role.utils";

export default function ProjectsPage() {
  const { data: projects = [] } = useProjects();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const byStatus = filter === "ALL" || p.status === filter;
      const bySearch = p.name.toLowerCase().includes(search.toLowerCase());
      return byStatus && bySearch;
    });
  }, [projects, filter, search]);

  return (
    <PageWrapper>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <Link
            to={isAdminRole(user?.role) ? "/projects/new" : "#"}
            onClick={(e) => {
              if (!isAdminRole(user?.role)) {
                e.preventDefault();
                toast.error("Only ADMIN can create projects");
              }
            }}
          >
            <Button>New Project</Button>
          </Link>
        </div>
        {!isAdminRole(user?.role) && (
          <div className="rounded-md border bg-white p-3 text-sm text-slate-600">
            Members can work on tasks, update task status, and collaborate in projects they are invited to.
            Only admins can create new projects.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {["ALL", "ACTIVE", "COMPLETED", "ARCHIVED"].map((s) => (
            <Button key={s} variant={filter === s ? "primary" : "secondary"} onClick={() => setFilter(s)}>
              {s}
            </Button>
          ))}
        </div>
        <Input placeholder="Search projects by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => <ProjectCard key={project._id} project={project} />)}
        </div>
      </div>
    </PageWrapper>
  );
}
