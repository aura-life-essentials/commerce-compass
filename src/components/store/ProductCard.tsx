import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye, Star, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getProductImage } from "@/lib/productImages";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description?: string;
    price: number;
    compare_at_price?: number | null;
    images?: string[];
    category?: string;
    tags?: string[];
    inventory_quantity?: number;
  };
  onAddToCart: () => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const discount = product.compare_at_price 
    ? Math.round((1 - product.price / product.compare_at_price) * 100) 
    : 0;

  const firstImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : null;
  const imageUrl = getProductImage(firstImage, product.title);

  const isTrending = product.tags?.includes('trending');
  const isViral = product.tags?.includes('tiktok-viral');
  const isLowStock = (product.inventory_quantity || 0) < 50 && (product.inventory_quantity || 0) > 0;

  // Stable rating based on product id hash instead of random
  const stableRating = useMemo(() => {
    const hash = product.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 4 + (hash % 2); // 4 or 5 stars
  }, [product.id]);

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
      <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 hover:border-primary/30 transition-all duration-500">
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none"
        />

        <div className="relative overflow-hidden">
          <AspectRatio ratio={1}>
            <motion.img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.5 }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          </AspectRatio>

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white font-bold">-{discount}%</Badge>
            )}
            {isTrending && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />TRENDING
              </Badge>
            )}
            {isViral && (
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <Zap className="w-3 h-3 mr-1" />VIRAL
              </Badge>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
            className="absolute top-3 right-3 flex flex-col gap-2"
          >
            <Button
              size="icon"
              variant="secondary"
              className={`w-9 h-9 rounded-full ${isWishlisted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800/80 text-white'} backdrop-blur-sm hover:bg-primary/20`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsWishlisted(!isWishlisted);
              }}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="w-9 h-9 rounded-full bg-slate-800/80 text-white backdrop-blur-sm hover:bg-primary/20"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </motion.div>

          {isLowStock && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-orange-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full text-center backdrop-blur-sm">
                🔥 Only {product.inventory_quantity} left in stock!
              </div>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {product.category && (
            <p className="text-xs text-primary/80 font-medium uppercase tracking-wider">{product.category}</p>
          )}

          <h3 className="font-semibold text-white line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= stableRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-slate-500 line-through">${product.compare_at_price.toFixed(2)}</span>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0.8, y: isHovered ? 0 : 5 }}
          >
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/80 hover:to-cyan-500/80 text-white font-medium"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  </Link>
  );
};
