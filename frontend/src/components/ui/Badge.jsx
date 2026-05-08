import { badgeColors } from "../../utils/helpers";

export default function Badge({ value, className = "" }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeColors[value] || "bg-slate-100 text-slate-700"} ${className}`}>
      {value}
    </span>
  );
}
