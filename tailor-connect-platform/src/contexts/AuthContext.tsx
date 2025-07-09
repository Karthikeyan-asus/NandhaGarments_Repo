
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/authService";
import { useToast } from "@/hooks/use-toast";

// Define the User type
interface User {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "org_admin" | "individual";
  orgId?: string;
  orgName?: string;
  isFirstLogin?: boolean;
  phone?: string;
}

// Define the Context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string, password: string }, role: "super_admin" | "org_admin" | "individual") => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  changePassword: (userType: string, email: string, newPassword: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (credentials: { email: string, password: string }, role: "super_admin" | "org_admin" | "individual"): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      let response;
      
      switch (role) {
        case "super_admin":
          response = await authService.loginSuperAdmin(credentials.email, credentials.password);
          if (response.success && response.admin) {
            const userData: User = {
              id: response.admin.id,
              name: response.admin.name,
              email: response.admin.email,
              role: "super_admin",
              isFirstLogin: response.admin.is_first_login,
            };
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            if (response.token) {
              localStorage.setItem("authToken", response.token);
            }
            navigate("/admin/dashboard");
            return true;
          }
          break;
          
        case "org_admin":
          response = await authService.loginOrgAdmin(credentials.email, credentials.password);
          if (response.success && response.admin) {
            const userData: User = {
              id: response.admin.id,
              name: response.admin.name,
              email: response.admin.email,
              role: "org_admin",
              orgId: response.admin.org_id,
              orgName: response.admin.org_name,
              isFirstLogin: response.admin.is_first_login,
            };
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            if (response.token) {
              localStorage.setItem("authToken", response.token);
            }
            navigate("/");
            return true;
          }
          break;
          
        case "individual":
          response = await authService.loginIndividual(credentials.email, credentials.password);
          if (response.success && response.user) {
            const userData: User = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              role: "individual",
              phone: response.user.phone,
            };
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            if (response.token) {
              localStorage.setItem("authToken", response.token);
            }
            navigate("/");
            return true;
          }
          break;
          
        default:
          throw new Error(`Invalid role: ${role}`);
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    navigate("/login-type");
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };
  
  // Change password function
  const changePassword = async (userType: string, email: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authService.resetPassword(userType, email, newPassword);
      if (response.success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to change password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Error",
        description: "An error occurred while changing password",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Signup function (placeholder - to be implemented with actual API)
  const signup = async (userData: any): Promise<boolean> => {
    try {
      // This would be replaced with actual API call
      console.log("Sign up with data:", userData);
      toast({
        title: "Success",
        description: "Account created successfully. You can now login.",
      });
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
      return false;
    }
  };

  // Return the Provider
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        changePassword,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
