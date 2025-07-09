
import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader } from "../ui/loader";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }
  
  // Redirect if not authenticated or not a super admin
  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/super-admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
