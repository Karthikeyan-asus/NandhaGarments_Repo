import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader } from "@/components/ui/loader";
import { ProductCard } from "@/components/common/ProductCard";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  ShoppingCart,
  MinusCircle,
  PlusCircle,
  X,
  Check 
} from "lucide-react";
import { ordersService } from "@/api/ordersService";
import { productsService } from "@/api/productsService";
import { measurementsService, MeasurementSummary } from "@/api/measurementsService";
import { usersService, OrgUserResponse } from "@/api/usersService";
import { ProductCategory } from "@/types";

interface Product {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: number;
  image: string;
  category_name: string;
  created_at: string;
  updated_at: string;
}

// Cart item interface
interface CartItem {
  product: Product;
  quantity: number;
}

export default function OrderForEmployeePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<OrgUserResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [isConfirmOrderOpen, setIsConfirmOrderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingMeasurements, setMissingMeasurements] = useState(false);
  
  useEffect(() => {
    if (user && user.role !== 'org_admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!userId || !user || !user.orgId) return;
      
      try {
        const response = await usersService.getOrgUsersByOrg(user.orgId);
        if (response.success) {
          const foundEmployee = response.users.find(u => u.id === userId);
          if (foundEmployee) {
            setEmployee(foundEmployee);
          } else {
            toast({
              title: "Error",
              description: "Employee not found",
              variant: "destructive",
            });
            navigate("/org-users");
          }
        }
      } catch (error) {
        console.error("Failed to fetch employee:", error);
        toast({
          title: "Error",
          description: "Failed to load employee data",
          variant: "destructive",
        });
        navigate("/org-users");
      }
    };

    fetchEmployee();
  }, [userId, user, navigate, toast]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const productsResponse = await productsService.getAllProducts();
        if (productsResponse.success) {
          setProducts(productsResponse.products);
          
          // Create a list of unique category names
          const uniqueCategories = Array.from(
            new Set(productsResponse.products.map(p => p.category_name))
          ) as string[];
          setCategories(uniqueCategories);
        }
        
        const measurementsResponse = await measurementsService.getUserMeasurements(userId, "org_user");
        if (measurementsResponse.success) {
          setMeasurements(measurementsResponse.measurements);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load products or measurements",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, toast]);

  useEffect(() => {
    if (cart.length === 0 || measurements.length === 0) {
      setMissingMeasurements(false);
      return;
    }

    const cartCategories = new Set(cart.map(item => item.product.category_name.toLowerCase()));
    
    const measurementTypes = new Set(measurements.map(m => m.type_name.toLowerCase()));
    
    setMissingMeasurements(
      Array.from(cartCategories).some(category => !Array.from(measurementTypes).some(type => type.includes(category)))
    );
  }, [cart, measurements]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
    
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => 
        prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (missingMeasurements) {
      setIsMeasurementDialogOpen(true);
    } else {
      setIsConfirmOrderOpen(true);
    }
  };

  const placeOrder = async () => {
    if (!userId || !user || cart.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user.id,
        userType: 'org_admin',
        totalAmount: calculateTotal(),
        orgUserId: userId,
        products: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };
      
      const response = await ordersService.createOrder(
        orderData.userId,
        orderData.userType,
        orderData.products,
        orderData.totalAmount,
        orderData.orgUserId
      );
      
      if (response.success) {
        toast({
          title: "Order Placed Successfully",
          description: "Your order has been confirmed",
        });
        
        setCart([]);
        navigate("/orders");
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        title: "Order Failed",
        description: "There was an issue placing your order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsConfirmOrderOpen(false);
    }
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category_name === selectedCategory);

  const mapCategoryNameToProductCategory = (categoryName: string): ProductCategory => {
    // Convert the category_name to match one of the ProductCategory enum values
    const lowerCaseName = categoryName.toLowerCase().replace(/\s+/g, '_');
    
    if (lowerCaseName.includes('school') || lowerCaseName.includes('uniform')) {
      return 'school_uniform';
    } else if (lowerCaseName.includes('sport')) {
      return 'sports_wear';
    } else if (lowerCaseName.includes('corporate') || lowerCaseName.includes('business')) {
      return 'corporate_wear';
    } else {
      return 'casual_wear'; // Default to casual_wear if no match
    }
  };

  if (isLoading || !employee) {
    return (
      <MainLayout>
        <Loader text="Loading products..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary flex items-center"
          onClick={() => navigate("/org-users")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employee List
        </Button>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Order for {employee.name}
            </h1>
            <p className="text-gray-600">
              Select products and place an order on behalf of this employee
            </p>
          </div>
          <Button 
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </Button>
        </div>
        
        <div className="mb-6">
          <Label htmlFor="category" className="block mb-2">Filter by Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                category: mapCategoryNameToProductCategory(product.category_name),
                description: product.description,
                price: product.price,
                image: product.image,
                createdAt: product.created_at,
                updatedAt: product.updated_at
              }}
              onAddToCart={() => addToCart(product)}
            />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}
      </div>

      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
            <DialogDescription>
              Review your items before checkout
            </DialogDescription>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCartOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex items-center justify-between py-4 border-b"
                  >
                    <div className="flex items-center space-x-4">
                      {item.product.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">₹{item.product.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => updateQuantity(item.product.id, 0)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Amount:</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    onClick={handleCheckout}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isMeasurementDialogOpen} onOpenChange={setIsMeasurementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-500">Missing Measurements</DialogTitle>
            <DialogDescription>
              This employee is missing measurements required for the products in your cart
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              Before placing an order, please add the following measurements:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {cart.map(item => {
                const category = item.product.category_name.toLowerCase();
                const hasMeasurement = measurements.some(m => 
                  m.type_name.toLowerCase().includes(category)
                );
                
                if (!hasMeasurement) {
                  return (
                    <li key={item.product.id}>
                      {item.product.category_name} measurements (required for {item.product.name})
                    </li>
                  );
                }
                return null;
              }).filter(Boolean)}
            </ul>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsMeasurementDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsMeasurementDialogOpen(false);
                navigate(`/org-user-measurements/${userId}`);
              }}
            >
              Add Measurements
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmOrderOpen}
        onOpenChange={setIsConfirmOrderOpen}
        onConfirm={placeOrder}
        title="Confirm Order"
        description={`Are you sure you want to place this order for ${employee.name}?`}
        confirmLabel="Place Order"
        cancelLabel="Cancel"
        isLoading={isSubmitting}
      />
    </MainLayout>
  );
}
