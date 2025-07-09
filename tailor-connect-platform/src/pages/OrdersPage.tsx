
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageLoader } from "@/components/ui/loader";
import { useAuth } from "@/contexts/AuthContext";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ordersService, Order, OrderProduct } from "@/api/ordersService";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        let response;
        
        if (user.role === 'org_admin') {
          if (user.orgId) {
            response = await ordersService.getOrdersByOrg(user.orgId);
          }
        } else {
          response = await ordersService.getOrdersByUser(user.id, user.role);
        }
        
        if (response && response.success) {
          setOrders(response.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const viewOrderDetails = async (orderId: string) => {
    try {
      const response = await ordersService.getOrderById(orderId);
      
      if (response.success) {
        setSelectedOrder(response.order);
        setIsOrderDetailOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader text="Loading your orders..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and track all your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-1">No orders yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <Button asChild>
                <a href="/products">Browse Products</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View the status and details of your previous orders
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      {user?.role === 'org_admin' && <TableHead>Employee</TableHead>}
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </TableCell>
                        {user?.role === 'org_admin' && (
                          <TableCell>
                            {order.org_user_name || "N/A"}
                          </TableCell>
                        )}
                        <TableCell>₹{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetails(order.id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              {selectedOrder.org_user_name && (
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <p className="font-medium">{selectedOrder.org_user_name}</p>
                </div>
              )}

              <div>
                <p className="font-medium mb-3">Status</p>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div>
                <p className="font-medium mb-3">Items</p>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products?.map((product: OrderProduct) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right">₹{product.price.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            ₹{(product.price * product.quantity).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{selectedOrder.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
