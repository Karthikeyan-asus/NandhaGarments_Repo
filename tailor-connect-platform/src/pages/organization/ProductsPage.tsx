
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
import { productsService, Product, ProductCategory } from "@/api/productsService";
import { FileUpload } from "@/components/common/FileUpload";
import { Plus, Image } from "lucide-react";

interface CustomProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  created_at: string;
  category_name: string;
}

// Form schema for adding custom products
const customProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  image: z.string().optional(),
});

export default function OrganizationProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    form.setValue("image", url);
  };

  const goToOrderPage = (employeeId: string) => {
    navigate(`/organization/order-for-employee/${employeeId}`);
  };

  const openEmployeeSelection = () => {
    navigate("/organization/org-users");
  };

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category_name === selectedCategory);

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
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Products Catalog</h1>
            <p className="text-gray-600">Browse and order products for your employees</p>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={openEmployeeSelection} variant="default">
              Order For Employee
            </Button>
            <Button onClick={() => setIsAddProductOpen(true)} variant="outline">
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
                <ProductCard key={product.id} product={product} onAction={openEmployeeSelection} />
              ))}
            </div>
          </TabsContent>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products
                  .filter(product => product.category_name === category)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} onAction={openEmployeeSelection} />
                  ))}
              </div>
            </TabsContent>
          ))}
          
          <TabsContent value="custom">
            {customProducts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No custom products yet</h3>
                <p className="text-gray-500 mb-4">Add your own custom products to order them for employees</p>
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
                    onAction={openEmployeeSelection}
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
    </MainLayout>
  );
}

// Product Card Component
function ProductCard({ 
  product, 
  onAction,
  isCustom = false 
}: { 
  product: Product; 
  onAction: (id?: string) => void;
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
          onClick={() => onAction()}
        >
          Order For Employee
        </Button>
      </CardFooter>
    </Card>
  );
}
