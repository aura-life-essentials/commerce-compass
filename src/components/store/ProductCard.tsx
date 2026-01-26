import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye, Star, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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

  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

  const isTrending = product.tags?.includes('trending');
  const isViral = product.tags?.includes('tiktok-viral');
  const isLowStock = (product.inventory_quantity || 0) < 50;

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 hover:border-primary/30 transition-all duration-500">
        {/* Glow Effect on Hover */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none"
        />

        {/* Image Container */}
        <div className="relative overflow-hidden">
          <AspectRatio ratio={1}>
            <motion.img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          </AspectRatio>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white font-bold">
                -{discount}%
              </Badge>
            )}
            {isTrending && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                TRENDING
              </Badge>
            )}
            {isViral && (
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                <Zap className="w-3 h-3 mr-1" />
                VIRAL
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
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
            >
              <Eye className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Low Stock Warning */}
          {isLowStock && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-orange-500/90 text-white text-xs font-medium px-3 py-1.5 rounded-full text-center backdrop-blur-sm">
                🔥 Only {product.inventory_quantity} left in stock!
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-primary/80 font-medium uppercase tracking-wider">
              {product.category}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-white line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
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
              ({Math.floor(Math.random() * 500) + 100})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-slate-500 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0.8, y: isHovered ? 0 : 5 }}
          >
            <Button
              onClick={onAddToCart}
              className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/80 hover:to-cyan-500/80 text-white font-medium"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
