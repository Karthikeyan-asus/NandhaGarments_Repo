
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ordersService, Order, OrderProduct } from "@/api/ordersService";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/loader";

export default function SuperAdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  useEffect(() => {
    const fetchAllOrders = async () => {
      setIsLoading(true);
      try {
        const response = await ordersService.getAllOrders();
        
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

    fetchAllOrders();
  }, [toast]);

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

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case "individual":
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Individual</Badge>;
      case "org_admin":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Organization</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await ordersService.updateOrderStatus(orderId, status);
      
      if (response.success) {
        toast({
          title: "Status Updated",
          description: `Order status changed to ${status}`,
        });
        
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        
        // Update selected order if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader text="Loading orders..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">All Orders</h1>
          <p className="text-gray-600">
            Manage and monitor all orders across the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>
              View details and update status of all orders
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {getUserTypeBadge(order.user_type)}
                      </TableCell>
                      <TableCell>{order.user_name || "—"}</TableCell>
                      <TableCell>{order.org_name || "—"}</TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
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
                
                <div>
                  <p className="text-sm text-gray-500">User Type</p>
                  <p>{getUserTypeBadge(selectedOrder.user_type)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{selectedOrder.user_name || "—"}</p>
                </div>
                
                {selectedOrder.org_name && (
                  <div>
                    <p className="text-sm text-gray-500">Organization</p>
                    <p className="font-medium">{selectedOrder.org_name}</p>
                  </div>
                )}
                
                {selectedOrder.org_user_name && (
                  <div className={selectedOrder.org_name ? "text-right" : ""}>
                    <p className="text-sm text-gray-500">Employee</p>
                    <p className="font-medium">{selectedOrder.org_user_name}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-medium mb-3">Status</p>
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedOrder.status)}
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant={selectedOrder.status === "pending" ? "default" : "outline"}
                      onClick={() => updateOrderStatus(selectedOrder.id, "pending")}
                    >
                      Pending
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedOrder.status === "processing" ? "default" : "outline"}
                      onClick={() => updateOrderStatus(selectedOrder.id, "processing")}
                    >
                      Processing
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedOrder.status === "completed" ? "default" : "outline"}
                      onClick={() => updateOrderStatus(selectedOrder.id, "completed")}
                    >
                      Completed
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedOrder.status === "cancelled" ? "default" : "outline"}
                      onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}
                    >
                      Cancelled
                    </Button>
                  </div>
                </div>
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
    </AdminLayout>
  );
}
