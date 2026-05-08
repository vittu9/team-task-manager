import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function PageWrapper({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
