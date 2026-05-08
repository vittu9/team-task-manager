import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 text-center shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Access Denied</h1>
        <p className="mb-4 text-sm text-slate-600">
          You do not have permission to access this page with your current role.
        </p>
        <Link to="/dashboard" className="inline-block rounded bg-blue-600 px-4 py-2 text-white">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
