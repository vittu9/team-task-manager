import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

const columns = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

export default function KanbanBoard({ tasks = [], onStatusChange }) {
  const grouped = columns.reduce((acc, c) => ({ ...acc, [c]: tasks.filter((t) => t.status === c) }), {});

  const handleDragEnd = ({ active, over }) => {
    if (!active || !over) return;
    const task = tasks.find((t) => t._id === active.id);
    const newStatus = over.data.current?.column || over.id;
    if (task && newStatus && task.status !== newStatus) onStatusChange?.(task, newStatus);
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 md:grid-cols-4">
        {columns.map((col) => (
          <div key={col} className="rounded-lg bg-slate-100 p-3">
            <h4 className="mb-2 font-semibold text-sm">{col.replaceAll("_", " ")}</h4>
            <SortableContext items={grouped[col].map((t) => t._id)} strategy={verticalListSortingStrategy}>
              <div id={col} className="space-y-2">
                {grouped[col].map((task) => (
                  <div key={task._id}>
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
