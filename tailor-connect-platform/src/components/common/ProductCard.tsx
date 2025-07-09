
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import placeholder from "/placeholder.svg";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden card-hover">
      <CardHeader className="p-0">
        <div className="h-48 overflow-hidden bg-gray-100">
          <img
            src={product.image || placeholder}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-medium text-lg">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.category.replace('_', ' ')}</p>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <div className="mt-3">
          <p className="text-lg font-semibold">₹{product.price.toLocaleString()}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full"
          variant="outline"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
