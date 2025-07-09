
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Welcome Back"
      description="Please select your account type to continue"
    >
      <div className="flex flex-col space-y-4 mt-6">
        <Button 
          onClick={() => navigate("/login/individual")}
          className="w-full py-6 text-base"
        >
          Individual Login
        </Button>
        
        <Button 
          onClick={() => navigate("/login/business")}
          className="w-full py-6 text-base"
          variant="outline"
        >
          Business Login
        </Button>
        
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => navigate("/super-admin/login")}
            className="text-sm"
          >
            Super Admin Login
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
