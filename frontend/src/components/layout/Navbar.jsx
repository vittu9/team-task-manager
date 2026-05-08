import { useAuthStore } from "../../store/authStore";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3">
      <div className="font-medium">Welcome, {user?.name || "User"}</div>
      <div className="flex items-center gap-3">
        <Avatar name={user?.name || "User"} size="sm" />
        <Button variant="ghost" onClick={logout}>Logout</Button>
      </div>
    </header>
  );
}
