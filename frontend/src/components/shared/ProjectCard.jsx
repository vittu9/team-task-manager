import { Link } from "react-router-dom";
import Badge from "../ui/Badge";

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project._id}`} className="block rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{project.name}</h3>
        <Badge value={project.status} />
      </div>
      <p className="line-clamp-2 text-sm text-slate-600">{project.description || "No description"}</p>
      <p className="mt-2 text-xs text-slate-500">Members: {project.members?.length || 0}</p>
    </Link>
  );
}
