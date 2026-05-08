import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";

export default function TaskCard({ task }) {
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <p className="font-medium">{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <Badge value={task.priority} />
        <Avatar name={task.assignedTo?.name || "Unassigned"} size="sm" />
      </div>
    </div>
  );
}
