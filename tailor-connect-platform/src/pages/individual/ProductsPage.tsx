
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageLoader } from "@/components/ui/loader";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { productsService, Product } from "@/api/productsService";
import { FileUpload } from "@/components/common/FileUpload";
import { Plus, Image, ShoppingCart, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  created_at: string;
  category_name: string;
}

interface CartItem {
  product: Product | CustomProduct;
  quantity: number;
}

// Form schema for adding custom products
const customProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  image: z.string().optional(),
});

export default function IndividualProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false);

  // Form for adding custom products
  const form = useForm<z.infer<typeof customProductSchema>>({
    resolver: zodResolver(customProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
    },
  });

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsService.getAllProducts();
        
        if (response.success) {
          setProducts(response.products);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(response.products.map((p: Product) => p.category_name))
          );
          setCategories(uniqueCategories as string[]);
        }
        
        // Fetch custom products (assuming we'll have an API for this)
        // For now, use empty array as placeholder
        setCustomProducts([]);
        
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const handleAddProduct = async (values: z.infer<typeof customProductSchema>) => {
    try {
      // Add the image URL to the values
      const productData = {
        ...values,
        image: imageUrl,
      };
      
      // Mock API call - in real implementation this would be a call to add custom product
      console.log("Adding custom product", productData);
      
      // Add to local state for now
      const newCustomProduct: CustomProduct = {
        id: `custom-${Date.now()}`,
        name: productData.name,
        description: productData.description || "",
        price: productData.price,
        image: productData.image || "/placeholder.svg",
        created_at: new Date().toISOString(),
        category_name: "Custom Products",
      };
      
      setCustomProducts([...customProducts, newCustomProduct]);
      
      toast({
        title: "Product Added",
        description: "Your custom product has been added successfully",
      });
      
      // Reset form and close dialog
      form.reset();
      setImageUrl("");
      setIsAddProductOpen(false);
      
      // Switch to custom products tab
      setActiveTab("custom");
      
    } catch (error) {
      console.error("Failed to add custom product:", error);
      toast({
        title: "Error",
        description: "Failed to add custom product",
        variant: "destructive",
      });
    }
  };

  const addToCart = (product: Product | CustomProduct) => {
    setCart(prev => {
      const existingItem = prev.find(item => 
        'category_id' in item.product && 'category_id' in product 
          ? item.product.id === product.id 
          : item.product.id === product.id
      );
      
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
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity, 
      0
    );
  };

  const checkout = () => {
    setIsCheckoutConfirmOpen(true);
  };

  const confirmCheckout = async () => {
    // In a real implementation, this would call the API to create an order
    try {
      toast({
        title: "Order Placed",
        description: "Your order has been successfully placed",
      });
      
      setCart([]);
      setIsCartOpen(false);
      setIsCheckoutConfirmOpen(false);
      
      // Navigate to orders page
      setTimeout(() => {
        navigate('/individual/orders');
      }, 1500);
    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        title: "Error",
        description: "Failed to place your order",
        variant: "destructive",
      });
      setIsCheckoutConfirmOpen(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    form.setValue("image", url);
  };

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-gray-600">Browse and order products that fit your needs</p>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => setIsCartOpen(true)}
              variant="outline"
              className="relative"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
              {cart.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </Badge>
              )}
            </Button>
            <Button onClick={() => setIsAddProductOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Custom Product
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Products</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
            <TabsTrigger value="custom">Custom Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAction={addToCart}
                  actionText="Add to Cart"
                />
              ))}
            </div>
          </TabsContent>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products
                  .filter(product => product.category_name === category)
                  .map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAction={addToCart}
                      actionText="Add to Cart"
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
          
          <TabsContent value="custom">
            {customProducts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No custom products yet</h3>
                <p className="text-gray-500 mb-4">Add your own custom products to order them</p>
                <Button onClick={() => setIsAddProductOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Custom Product
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {customProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      description: product.description,
                      image: product.image,
                      category_id: "custom",
                      category_name: "Custom Products",
                      created_at: product.created_at,
                      updated_at: product.created_at,
                    }}
                    onAction={addToCart}
                    actionText="Add to Cart"
                    isCustom={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Custom Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Custom Product</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddProduct)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        min="0" 
                        step="0.01" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <FileUpload 
                        onUpload={handleImageUpload} 
                        onLoading={setImageUploading} 
                        value={imageUrl} 
                        accept="image/*"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddProductOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={imageUploading}>
                  Add Product
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Shopping Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add products to your cart to checkout</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-4 pb-4 border-b">
                  <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product.image || "/placeholder.svg"} 
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">₹{item.product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                  Continue Shopping
                </Button>
                <Button onClick={checkout} disabled={cart.length === 0}>
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={isCheckoutConfirmOpen} onOpenChange={setIsCheckoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to place this order for ₹{calculateTotal().toLocaleString()}?</p>
            <p className="text-sm text-gray-500 mt-2">Once confirmed, your order will be processed.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCheckoutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCheckout}>
              <Check className="h-4 w-4 mr-2" /> Place Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

// Product Card Component
function ProductCard({ 
  product, 
  onAction,
  actionText,
  isCustom = false 
}: { 
  product: Product; 
  onAction: (product: Product) => void;
  actionText: string;
  isCustom?: boolean;
}) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="object-cover w-full h-full"
        />
        {isCustom && (
          <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
            Custom
          </span>
        )}
      </div>
      <CardContent className="flex-1 p-4">
        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2">
          {product.category_name}
        </p>
        <p className="font-semibold text-lg mb-2">₹{product.price.toLocaleString()}</p>
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}
      </CardContent>
      <CardFooter className="border-t p-4 bg-gray-50">
        <Button 
          className="w-full" 
          onClick={() => onAction(product)}
        >
          {actionText}
        </Button>
      </CardFooter>
    </Card>
  );
}
