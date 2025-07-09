
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loader";
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
import { Badge } from "@/components/ui/badge";
import { Eye, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for the users
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

// Mock service for users
const usersService = {
  getAllUsers: async (): Promise<{success: boolean, users: User[]}> => {
    // This would be replaced with an actual API call
    return {
      success: true,
      users: [
        {
          id: "user-001",
          name: "John Doe",
          email: "john@example.com",
          role: "individual",
          status: "active",
          created_at: "2025-04-01T00:00:00Z"
        },
        {
          id: "user-002",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "individual",
          status: "active",
          created_at: "2025-04-02T00:00:00Z"
        },
        {
          id: "oa-001",
          name: "Admin User",
          email: "admin@abccorp.com",
          role: "org_admin",
          status: "active",
          created_at: "2025-04-03T00:00:00Z"
        }
      ]
    };
  }
};

export default function SuperAdminManageUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await usersService.getAllUsers();
        
        if (response && response.success) {
          setUsers(response.users);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "individual":
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Individual</Badge>;
      case "org_admin":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Organization</Badge>;
      case "super_admin":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Super Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>;
      case "suspended":
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader text="Loading users..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
            <p className="text-gray-600">
              View and manage all users on the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {users.length} users found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
