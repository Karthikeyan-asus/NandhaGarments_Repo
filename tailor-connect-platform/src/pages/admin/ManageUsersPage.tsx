import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/loader";
import { mockDatabase } from "@/lib/mock-database";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { Eye, EyeOff, Plus, Search, Trash2, User, Users } from "lucide-react";

const superAdminFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const organizationFormSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  pan: z.string().min(1, "PAN is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  gstin: z.string().min(1, "GSTIN is required"),
  initialPassword: z.string().min(6, "Initial password must be at least 6 characters"),
});

export default function ManageUsersPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("admins");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [superAdmins, setSuperAdmins] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [orgAdmins, setOrgAdmins] = useState<any[]>([]);
  const [individuals, setIndividuals] = useState<any[]>([]);
  
  const [isCreateSuperAdminOpen, setIsCreateSuperAdminOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInitialPassword, setShowInitialPassword] = useState(false);

  const superAdminForm = useForm<z.infer<typeof superAdminFormSchema>>({
    resolver: zodResolver(superAdminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const organizationForm = useForm<z.infer<typeof organizationFormSchema>>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: "",
      pan: "",
      email: "",
      phone: "",
      address: "",
      gstin: "",
      initialPassword: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API request
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        setSuperAdmins(mockDatabase.superAdmins);
        setOrganizations(mockDatabase.organizations);
        setOrgAdmins(mockDatabase.orgAdmins);
        setIndividuals(mockDatabase.individuals);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreateSuperAdmin = async (values: z.infer<typeof superAdminFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, we would send this to the backend
      toast({
        title: "Super Admin Created",
        description: "The super admin account has been created successfully",
      });
      
      setIsCreateSuperAdminOpen(false);
      superAdminForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrganization = async (values: z.infer<typeof organizationFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, we would send this to the backend including the initialPassword
      toast({
        title: "Organization Created",
        description: "The organization has been created successfully with an initial password",
      });
      
      setIsCreateOrgOpen(false);
      organizationForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully",
      });
      
      // Update state to reflect deletion
      if (userToDelete.role === 'super_admin') {
        setSuperAdmins(superAdmins.filter(admin => admin.id !== userToDelete.id));
      } else if (userToDelete.role === 'org_admin') {
        setOrgAdmins(orgAdmins.filter(admin => admin.id !== userToDelete.id));
      } else if (userToDelete.role === 'individual') {
        setIndividuals(individuals.filter(user => user.id !== userToDelete.id));
      }
      
      setIsConfirmDeleteOpen(false);
      setUserToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader text="Loading user data..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Manage Users</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search users..." 
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateSuperAdminOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Super Admin
          </Button>
          <Button onClick={() => setIsCreateOrgOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Organization
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="admins">
            <User className="h-4 w-4 mr-2" /> Super Admins
          </TabsTrigger>
          <TabsTrigger value="organizations">
            <Users className="h-4 w-4 mr-2" /> Organizations
          </TabsTrigger>
          <TabsTrigger value="individuals">
            <User className="h-4 w-4 mr-2" /> Individuals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="admins">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {superAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      No super admin users found
                    </TableCell>
                  </TableRow>
                ) : (
                  superAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>Super Admin</TableCell>
                      <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteClick(admin)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="organizations">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No organizations found
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org) => {
                    const admin = orgAdmins.find(a => a.orgId === org.id);
                    return (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell>{org.email}</TableCell>
                        <TableCell>{org.phone}</TableCell>
                        <TableCell>{org.gstin}</TableCell>
                        <TableCell>
                          {admin ? admin.name : "No admin assigned"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteClick({...org, role: 'organization'})}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="individuals">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {individuals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No individual users found
                    </TableCell>
                  </TableRow>
                ) : (
                  individuals.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{user.address}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteClick({...user, role: 'individual'})}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isCreateSuperAdminOpen} onOpenChange={setIsCreateSuperAdminOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Super Admin</DialogTitle>
            <DialogDescription>
              Add a new super admin account with full system access
            </DialogDescription>
          </DialogHeader>
          <Form {...superAdminForm}>
            <form onSubmit={superAdminForm.handleSubmit(handleCreateSuperAdmin)} className="space-y-6">
              <FormField
                control={superAdminForm.control}
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
              <FormField
                control={superAdminForm.control}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={superAdminForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            {...field}
                            className="pr-10"
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
                <FormField
                  control={superAdminForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            {...field}
                            className="pr-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
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
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateSuperAdminOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Super Admin"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Add a new business organization and admin account
            </DialogDescription>
          </DialogHeader>
          <Form {...organizationForm}>
            <form onSubmit={organizationForm.handleSubmit(handleCreateOrganization)} className="space-y-6">
              <FormField
                control={organizationForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={organizationForm.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter PAN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={organizationForm.control}
                  name="gstin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GSTIN</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter GSTIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={organizationForm.control}
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
                  control={organizationForm.control}
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
                control={organizationForm.control}
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
              <FormField
                control={organizationForm.control}
                name="initialPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Admin Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showInitialPassword ? "text" : "password"}
                          placeholder="Create an initial password"
                          {...field}
                          className="pr-10"
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowInitialPassword(!showInitialPassword)}
                      >
                        {showInitialPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Organization admin will be required to change this on first login
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOrgOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Organization"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
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
    </AdminLayout>
  );
}
