
import { ReactNode } from "react";
import Header from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader } from "../ui/loader";

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function MainLayout({ 
  children, 
  requireAuth = true,
  allowedRoles = [] 
}: MainLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }
  
  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login-type" replace />;
  }
  
  // Check role permissions if roles are specified
  if (requireAuth && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {/* Footer could be added here if needed */}
    </div>
  );
}
