
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
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
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ordersService, Order, OrderProduct } from "@/api/ordersService";
import { PageLoader } from "@/components/ui/loader";

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await ordersService.getAllOrders();
        if (response.success) {
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await ordersService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as Order['status'] } 
            : order
        ));
        
        toast({
          title: "Order Updated",
          description: `Order ${orderId} status changed to ${newStatus}`,
        });
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
      <AdminLayout>
        <PageLoader text="Loading orders..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Manage Orders</h1>
        <p className="text-gray-600 mb-8">View and manage all customer orders</p>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              {orders.length} orders found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
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
                          {order.org_user_id ? (
                            <span>
                              {order.user_name} 
                              <span className="text-xs text-gray-500 block">
                                For: {order.org_user_name}
                              </span>
                            </span>
                          ) : (
                            order.user_name || order.user_id
                          )}
                        </TableCell>
                        <TableCell>₹{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              defaultValue={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewOrderDetails(order.id)}
                            >
                              View
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

              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">
                  {selectedOrder.user_name || selectedOrder.user_id}
                  {selectedOrder.org_user_name && (
                    <span className="text-sm text-gray-500 ml-2">
                      (For employee: {selectedOrder.org_user_name})
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="font-medium mb-3">Status</p>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedOrder.status)}
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      updateOrderStatus(selectedOrder.id, value);
                      setSelectedOrder({...selectedOrder, status: value});
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
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
