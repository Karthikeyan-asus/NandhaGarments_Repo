
import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/loader";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function OrgAdminLoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const success = await login(
        { email: values.email, password: values.password },
        "org_admin"
      );

      if (success) {
        if (user?.isFirstLogin || user?.role === 'org_admin') {
          setShowPasswordChangeDialog(true);
        } else {
          navigate("/organization/products");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChangeDialog(false);
    navigate("/organization/products");
  };

  return (
    <>
      <AuthLayout
        title="Organization Admin Login"
        description="Access your organization's admin dashboard"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="h-11 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link 
                  to="/reset-password"
                  className="text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader size="small" /> : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/login-type" className="text-primary hover:underline font-medium text-sm">
              Back to login options
            </Link>
          </div>
        </div>
      </AuthLayout>

      <Dialog open={showPasswordChangeDialog} onOpenChange={setShowPasswordChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Your Password</DialogTitle>
            <DialogDescription>
              Since this is your first login, please change your password for security reasons.
            </DialogDescription>
          </DialogHeader>
          <ChangePasswordForm onSuccess={handlePasswordChangeSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
