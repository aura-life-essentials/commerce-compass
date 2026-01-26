import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getProductImage } from "@/lib/productImages";
import { Product } from "@/hooks/useProducts";

interface RelatedProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const RelatedProducts = ({ products, onAddToCart }: RelatedProductsProps) => {
  if (products.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            You Might Also Like
          </h2>
          <p className="text-muted-foreground">
            Customers who viewed this also viewed these products
          </p>
        </div>
        <Link to="/store">
          <Button variant="ghost" className="text-primary hover:text-primary/80">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => {
          const discount = product.compare_at_price 
            ? Math.round((1 - (product.price || 0) / product.compare_at_price) * 100) 
            : 0;
          
          const firstImage = Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : null;
          const imageUrl = getProductImage(firstImage, product.title);

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/product/${product.id}`}>
                <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <AspectRatio ratio={1}>
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    </AspectRatio>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold">
                        -{discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {product.category && (
                      <p className="text-xs text-primary/80 font-medium uppercase tracking-wider">
                        {product.category}
                      </p>
                    )}

                    <h3 className="font-semibold text-white line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">
                        ({Math.floor(Math.random() * 300) + 50})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">
                          ${(product.price || 0).toFixed(2)}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-sm text-slate-500 line-through">
                            ${product.compare_at_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="icon"
                        className="h-9 w-9 rounded-full bg-primary/20 hover:bg-primary text-primary hover:text-white transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
