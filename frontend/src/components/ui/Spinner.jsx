export default function Spinner({ size = "md" }) {
  const sizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" };
  return (
    <span
      className={`inline-block ${sizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent`}
      aria-label="Loading"
    />
  );
}
