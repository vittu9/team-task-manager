import { forwardRef } from "react";

const Input = forwardRef(function Input({ label, error, className = "", ...props }, ref) {
  return (
    <label className="block w-full">
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 ${className}`}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});

export default Input;
