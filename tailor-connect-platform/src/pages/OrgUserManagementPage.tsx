
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/loader";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Trash2, User, Users } from "lucide-react";
import { usersService, OrgUserResponse } from "@/api/usersService";

// Form validation schema
const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  age: z.coerce.number().optional(),
  department: z.string().optional(),
});

export default function OrgUserManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [orgUsers, setOrgUsers] = useState<OrgUserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<OrgUserResponse | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      age: undefined,
      department: "",
    },
  });

  // Redirect if not org_admin
  useEffect(() => {
    if (user && user.role !== 'org_admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch organization users
  useEffect(() => {
    const fetchOrgUsers = async () => {
      if (!user || !user.orgId) return;
      
      setIsLoading(true);
      try {
        const response = await usersService.getOrgUsersByOrg(user.orgId);
        if (response.success) {
          setOrgUsers(response.users);
        }
      } catch (error) {
        console.error("Failed to fetch org users:", error);
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgUsers();
  }, [user, toast]);

  const handleAddUser = async (values: z.infer<typeof userFormSchema>) => {
    if (!user || !user.orgId) return;
    
    setIsSubmitting(true);
    try {
      const response = await usersService.createOrgUser(
        user.orgId,
        values.name,
        values.email,
        values.phone,
        values.address,
        user.id,
        values.age,
        values.department
      );
      
      if (response.success) {
        toast({
          title: "Employee Added",
          description: "The employee has been added successfully",
        });
        
        // Refresh the user list
        const updatedResponse = await usersService.getOrgUsersByOrg(user.orgId);
        if (updatedResponse.success) {
          setOrgUsers(updatedResponse.users);
        }
        
        setIsAddUserOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Failed to add employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (orgUser: OrgUserResponse) => {
    setUserToDelete(orgUser);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsSubmitting(true);
    try {
      const response = await usersService.deleteOrgUser(userToDelete.id);
      
      if (response.success) {
        toast({
          title: "Employee Deleted",
          description: "The employee has been deleted successfully",
        });
        
        // Update the local state to remove the deleted user
        setOrgUsers(orgUsers.filter(user => user.id !== userToDelete.id));
      }
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsConfirmDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  // Filter users based on search query
  const filteredUsers = orgUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader text="Loading employees..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Employee Management</h1>
            <p className="text-gray-600">Manage your organization's employees</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search employees..." 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddUserOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Employee
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>
              {orgUsers.length} employees found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((orgUser) => (
                      <TableRow key={orgUser.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{orgUser.name}</TableCell>
                        <TableCell>{orgUser.email}</TableCell>
                        <TableCell>{orgUser.phone}</TableCell>
                        <TableCell>{orgUser.department || "—"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{orgUser.address}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/org-user-measurements/${orgUser.id}`)}
                            >
                              Measurements
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/order-for-employee/${orgUser.id}`)}
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                            >
                              Place Order
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(orgUser)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter age" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddUserOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Employee"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </MainLayout>
  );
}
