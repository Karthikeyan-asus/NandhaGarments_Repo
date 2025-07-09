
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
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader } from "@/components/ui/loader";

const emailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetFormSchema = z.object({
  code: z.string().min(6, "Please enter the verification code"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState("");

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulating API call for password reset request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmail(values.email);
      setStep('reset');
    } catch (error) {
      console.error("Error requesting password reset:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (values: z.infer<typeof resetFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulating API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Password reset successful. You can now log in with your new password.");
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={step === 'email' ? "Reset Your Password" : "Create New Password"}
      description={step === 'email' 
        ? "Enter your email to receive a password reset link" 
        : "Enter the code sent to your email and create a new password"}
    >
      {step === 'email' ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
            <FormField
              control={emailForm.control}
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

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader size="small" /> : "Send Reset Link"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
            <div className="bg-blue-50 p-3 rounded-md mb-6">
              <p className="text-sm text-blue-700">
                We've sent a verification code to <span className="font-medium">{email}</span>
              </p>
            </div>

            <FormField
              control={resetForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter verification code"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create a new password"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your new password"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader size="small" /> : "Reset Password"}
            </Button>
          </form>
        </Form>
      )}

      <div className="mt-8 text-center">
        <Link to="/login" className="text-primary hover:underline font-medium text-sm">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
