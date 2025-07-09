
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/loader";
import { mockDatabase } from "@/lib/mock-database";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { Plus, Search, Trash2, Edit } from "lucide-react";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().min(1, "Description is required"),
});

export default function ManageProductsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [products, setProducts] = useState<any[]>([]);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      description: "",
    },
  });

  const editProductForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API request
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        setProducts(mockDatabase.products);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (productToEdit) {
      editProductForm.reset({
        name: productToEdit.name,
        category: productToEdit.category,
        price: productToEdit.price.toString(),
        description: productToEdit.description,
      });
    }
  }, [productToEdit, editProductForm]);

  const handleCreateProduct = async (values: z.infer<typeof productFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newProduct = {
        id: `product-${Date.now()}`,
        name: values.name,
        category: values.category,
        price: parseFloat(values.price),
        description: values.description,
        createdAt: new Date().toISOString(),
      };
      
      setProducts([...products, newProduct]);
      
      toast({
        title: "Product Created",
        description: "The product has been created successfully",
      });
      
      setIsCreateProductOpen(false);
      productForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (values: z.infer<typeof productFormSchema>) => {
    if (!productToEdit) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const updatedProducts = products.map((product) => {
        if (product.id === productToEdit.id) {
          return {
            ...product,
            name: values.name,
            category: values.category,
            price: parseFloat(values.price),
            description: values.description,
          };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      
      toast({
        title: "Product Updated",
        description: "The product has been updated successfully",
      });
      
      setIsEditProductOpen(false);
      setProductToEdit(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setProducts(products.filter(product => product.id !== productToDelete.id));
      
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully",
      });
      
      setIsConfirmDeleteOpen(false);
      setProductToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader text="Loading product data..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Manage Products</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateProductOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{product.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProductToEdit(product);
                        setIsEditProductOpen(true);
                      }}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteClick(product)}
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
      
      {/* Create Product Dialog */}
      <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory
            </DialogDescription>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(handleCreateProduct)} className="space-y-6">
              <FormField
                control={productForm.control}
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
                control={productForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={productForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={productForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateProductOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details
            </DialogDescription>
          </DialogHeader>
          <Form {...editProductForm}>
            <form onSubmit={editProductForm.handleSubmit(handleEditProduct)} className="space-y-6">
              <FormField
                control={editProductForm.control}
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
                control={editProductForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editProductForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editProductForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditProductOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Product"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isSubmitting}
      />
    </AdminLayout>
  );
}
