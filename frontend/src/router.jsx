import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import CreateProjectPage from "./pages/projects/CreateProjectPage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import TaskDetailPage from "./pages/tasks/TaskDetailPage";
import AdminPage from "./pages/admin/AdminPage";
import MemberTasksPage from "./pages/tasks/MemberTasksPage";
import MemberTaskDetailPage from "./pages/tasks/MemberTaskDetailPage";
import MemberManagementPage from "./pages/admin/MemberManagementPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
import BulkAssignment from "./components/BulkAssignment";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { isAdminRole, isMemberRole } from "./utils/role.utils";
import LandingPage from "./pages/Landing/LandingPage";
import LandingNavbar from "./components/layout/LandingNavbar";

function ProtectedRoute() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  
  console.log("PROTECTED ROUTE RUNTIME VALUES", {
    isAuthenticated,
    isHydrated,
    user,
    pathname: location.pathname
  });
  
  // Wait for hydration to complete before checking auth state
  if (!isHydrated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{fontSize: '24px', fontWeight: 'bold'}}>Loading...</div>
        <div style={{color: '#666'}}>Authenticating...</div>
      </div>
    );
  }
  
  // After hydration, check auth state
  if (isAuthenticated) {
    return <Outlet />;
  } else {
    console.log("PROTECTED ROUTE - REDIRECTING TO LOGIN");
    return <Navigate to="/login" replace />;
  }
}

function AdminRoute() {
  const { user } = useAuthStore();
  return isAdminRole(user?.role) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}

function MemberRoute() {
  const { user } = useAuthStore();
  return isMemberRole(user?.role) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/projects/:id", element: <ProjectDetailPage /> },
      { path: "/projects/:id/bulk-assign", element: <BulkAssignment /> },
      { path: "/projects/:id/analytics", element: <AnalyticsDashboard /> },
      { path: "/tasks/:id", element: <TaskDetailPage /> },
      {
        element: <AdminRoute />,
        children: [
          { path: "/admin", element: <AdminPage /> },
          { path: "/admin/members", element: <MemberManagementPage /> },
          { path: "/projects/new", element: <CreateProjectPage /> },
        ],
      },
      {
        element: <MemberRoute />,
        children: [
          { path: "/member/tasks", element: <MemberTasksPage /> },
          { path: "/member/tasks/:id", element: <MemberTaskDetailPage /> },
        ],
      },
    ],
  },
]);

export default router;
