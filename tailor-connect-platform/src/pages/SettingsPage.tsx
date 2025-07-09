import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usersService } from "@/api/usersService";
import { PageLoader } from "@/components/ui/loader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      address: "", // Will be populated once we have user data
    },
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        form.setValue("name", user.name);
        form.setValue("address", ""); // This would come from API
        
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        toast({
          title: "Error",
          description: "Failed to load user details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [user, form, toast]);

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      let response;
      
      /*
      if (user.role === "super_admin") {
        response = await usersService.updateSuperAdmin(user.id, {
          name: values.name
        });
      } else if (user.role === "org_admin") {
        response = await usersService.updateOrgAdmin(user.id, {
          name: values.name
        });
      } else if (user.role === "individual") {
        response = await usersService.updateIndividual(user.id, {
          name: values.name,
          address: values.address
        });
      }
      */
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateUser({
        name: values.name,
        // address would be added to the user object if we had that field
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      user?.role === "super_admin" ? <AdminLayout><PageLoader text="Loading settings..." /></AdminLayout>
      : <MainLayout><PageLoader text="Loading settings..." /></MainLayout>
    );
  }

  const LayoutComponent = user?.role === "super_admin" ? AdminLayout : MainLayout;

  return (
    <LayoutComponent>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Settings</h1>

        <div className="grid grid-cols-1 gap-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled className="bg-gray-50" />
                <p className="mt-1 text-sm text-gray-500">
                  Your email address cannot be changed
                </p>
              </div>
              
              <div>
                <Label htmlFor="role">Account Type</Label>
                <Input 
                  id="role"
                  value={
                    user?.role === "super_admin" 
                      ? "Super Admin" 
                      : user?.role === "org_admin"
                      ? "Organization Admin"
                      : "Individual User"
                  } 
                  disabled 
                  className="bg-gray-50" 
                />
              </div>

              {user?.role === "org_admin" && (
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" value={user?.orgName || ""} disabled className="bg-gray-50" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutComponent>
  );
}
