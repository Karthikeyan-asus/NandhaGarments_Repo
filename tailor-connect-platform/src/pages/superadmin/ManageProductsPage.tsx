
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
import { Edit, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for the products
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  created_at: string;
}

// Mock service for products
const productsService = {
  getAllProducts: async (): Promise<{success: boolean, products: Product[]}> => {
    // This would be replaced with an actual API call
    return {
      success: true,
      products: [
        {
          id: "prod-001",
          name: "Formal Shirt",
          category: "clothing",
          price: 1299,
          stock: 100,
          status: "active",
          created_at: "2025-04-01T00:00:00Z"
        },
        {
          id: "prod-002",
          name: "Business Suit",
          category: "clothing",
          price: 7999,
          stock: 50,
          status: "active",
          created_at: "2025-04-02T00:00:00Z"
        },
        {
          id: "prod-003",
          name: "Casual T-shirt",
          category: "clothing",
          price: 899,
          stock: 150,
          status: "out_of_stock",
          created_at: "2025-04-03T00:00:00Z"
        }
      ]
    };
  }
};

export default function SuperAdminManageProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productsService.getAllProducts();
        
        if (response && response.success) {
          setProducts(response.products);
        }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>;
      case "out_of_stock":
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader text="Loading products..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Products</h1>
            <p className="text-gray-600">
              View and manage all products on the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>
              {products.length} products found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>₹{product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
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
