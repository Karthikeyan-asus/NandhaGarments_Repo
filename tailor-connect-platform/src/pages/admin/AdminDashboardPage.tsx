
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { productsService } from "@/api/productsService";
import { ordersService } from "@/api/ordersService";
import { usersService } from "@/api/usersService";
import { Users, ShoppingCart, User } from "lucide-react";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard metrics
  const [individualCount, setIndividualCount] = useState(0);
  const [orgUserCount, setOrgUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [monthlyOrdersCount, setMonthlyOrdersCount] = useState(0);
  const [yearlyOrdersCount, setYearlyOrdersCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data in parallel
        const [individualResponse, orgUserResponse, productsResponse, ordersResponse] = await Promise.all([
          // Get individual users count (simulating count)
          usersService.getAllOrgAdmins().catch(() => ({ success: true, admins: [] })),
          
          // Get organization users count (simulating count)
          usersService.getAllOrgUsers().catch(() => ({ success: true, users: [] })),
          
          // Get products count
          productsService.getAllProducts().catch(() => ({ success: true, products: [] })),
          
          // Get orders data
          ordersService.getAllOrders().catch(() => ({ success: true, orders: [] }))
        ]);

        // Process the data
        if (individualResponse.success) {
          setIndividualCount(individualResponse.admins.length);
        }
        
        if (orgUserResponse.success) {
          setOrgUserCount(orgUserResponse.users.length);
        }
        
        if (productsResponse.success) {
          setProductCount(productsResponse.products.length);
        }
        
        if (ordersResponse.success) {
          const orders = ordersResponse.orders;
          setTotalOrdersCount(orders.length);
          
          // Calculate orders for current month
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          // Filter orders for current month
          const monthlyOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
          });
          setMonthlyOrdersCount(monthlyOrders.length);
          
          // Filter orders for current year
          const yearlyOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.getFullYear() === currentYear;
          });
          setYearlyOrdersCount(yearlyOrders.length);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader text="Loading dashboard data..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Statistics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <User className="mr-2 h-5 w-5 text-gray-500" />
                Individual Users
              </CardTitle>
              <CardDescription>Total registered individual users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{individualCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Users className="mr-2 h-5 w-5 text-gray-500" />
                Organization Users
              </CardTitle>
              <CardDescription>Total organization employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orgUserCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5 text-gray-500" />
                Products
              </CardTitle>
              <CardDescription>Total available products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{productCount}</div>
            </CardContent>
          </Card>
          
          {/* Orders Statistics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Orders</CardTitle>
              <CardDescription>All-time orders placed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalOrdersCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Monthly Orders</CardTitle>
              <CardDescription>Orders placed this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyOrdersCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Yearly Orders</CardTitle>
              <CardDescription>Orders placed this year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{yearlyOrdersCount}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
