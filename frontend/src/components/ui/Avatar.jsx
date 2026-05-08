const palette = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];

const hash = (s) => [...s].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

export default function Avatar({ name = "User", size = "md" }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = palette[hash(name) % palette.length];

  return <span className={`inline-flex ${sizes[size]} ${color} items-center justify-center rounded-full font-semibold text-white`}>{initials}</span>;
}
