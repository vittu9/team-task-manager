import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Navbar from "./components/layout/Navbar";
import LandingNavbar from "./components/layout/LandingNavbar";

export default function App() {
  const { isAuthenticated, user } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <>
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
        </>
      ) : (
        <>
          <LandingNavbar />
          <main className="flex-1">
            <Outlet />
          </main>
        </>
      )}
    </div>
  );
}
