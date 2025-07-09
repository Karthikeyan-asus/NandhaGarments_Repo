
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductCard } from "@/components/common/ProductCard";
import { PageLoader } from "@/components/ui/loader";
import { Product } from "@/types";
import { mockDatabase } from "@/lib/mock-database";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [orderConfirmOpen, setOrderConfirmOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate API fetch delay
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProducts(mockDatabase.products);
        setFilteredProducts(mockDatabase.products);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products, activeTab]);

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category tab
    if (activeTab !== "all") {
      filtered = filtered.filter(product => product.category === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price range if needed later
    
    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      return [...prev, { product, quantity: 1 }];
    });
    
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to complete your purchase",
        variant: "destructive",
      });
      navigate("/login-type");
      return;
    }
    
    setOrderConfirmOpen(true);
  };

  const confirmOrder = () => {
    // In a real app, we'd send this to the backend
    toast({
      title: "Order Placed Successfully!",
      description: "Your order has been confirmed and is being processed",
    });
    setCartItems([]);
    setOrderConfirmOpen(false);
    
    // Navigate to orders page after a short delay
    setTimeout(() => {
      navigate('/orders');
    }, 1500);
  };

  const categories = [
    { value: "school_uniform", label: "School Uniform" },
    { value: "sports_wear", label: "Sports Wear" },
    { value: "corporate_wear", label: "Corporate Wear" },
    { value: "casual_wear", label: "Casual Wear" },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader text="Loading products..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Our Products</h1>
            <p className="text-gray-600">Discover quality garments for all your needs</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                      {cartItems.reduce((total, item) => total + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Shopping Cart</SheetTitle>
                  <SheetDescription>
                    Review your items before checking out
                  </SheetDescription>
                </SheetHeader>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col gap-6">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden">
                            <img
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">
                              ₹{item.product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-medium">₹{getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                <SheetFooter className="mt-6">
                  <Button
                    disabled={cartItems.length === 0}
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="overflow-x-auto pb-2">
            <TabsList className="h-10">
              <TabsTrigger value="all" className="px-4">
                All Products
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="px-4"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No products found in this category</h3>
                  <p className="text-gray-500">Try another category or adjust your search</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <ConfirmationDialog
        open={orderConfirmOpen}
        onOpenChange={setOrderConfirmOpen}
        onConfirm={confirmOrder}
        title="Confirm Your Order"
        description="Are you sure you want to place this order? Once confirmed, your order will be processed."
        confirmLabel="Place Order"
        cancelLabel="Cancel"
      />
    </MainLayout>
  );
}
