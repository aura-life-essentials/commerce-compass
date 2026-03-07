import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Heart, Star, Zap, TrendingUp,
  ChevronLeft, ChevronRight, Package, Truck, Shield, 
  RotateCcw, Check, Minus, Plus, X, ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { getProductImage } from "@/lib/productImages";
import { ImageGallery } from "@/components/store/ImageGallery";
import { RelatedProducts } from "@/components/store/RelatedProducts";
import { CartDrawer } from "@/components/store/CartDrawer";
import { SocialShareButtons } from "@/components/store/SocialShareButtons";
import { useSEOHead } from "@/hooks/useSEOHead";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const { cart, addToCart, cartTotal, cartCount } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const product = products?.find(p => p.id === productId);
  const relatedProducts = products?.filter(
    p => p.id !== productId && p.category === product?.category
  ).slice(0, 4) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-white">Product Not Found</h1>
        <Link to="/store">
          <Button>Back to Store</Button>
        </Link>
      </div>
    );
  }

  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(img => getProductImage(img, product.title))
    : [getProductImage(null, product.title)];

  const productUrl = `https://trendvault.store/product/${product.id}`;

  // SEO for this product
  useSEOHead({
    title: product.title,
    description: product.description || `Shop ${product.title} at TrendVault. Fast shipping & easy returns.`,
    image: productImages[0],
    type: "product",
    price: product.price || 0,
    productName: product.title,
  });

  const discount = product.compare_at_price 
    ? Math.round((1 - (product.price || 0) / product.compare_at_price) * 100) 
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setCartOpen(true);
  };

  const isTrending = product.tags?.includes('trending');
  const isViral = product.tags?.includes('tiktok-viral');
  const isLowStock = (product.inventory_quantity || 0) < 50 && (product.inventory_quantity || 0) > 0;

  // Stable rating based on product id
  const stableReviewCount = useMemo(() => {
    const hash = product.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 50 + (hash % 200);
  }, [product.id]);

  const reviews = [
    { name: "Sarah M.", rating: 5, text: "Absolutely love this product! Exceeded my expectations in every way.", date: "2 days ago", verified: true },
    { name: "James K.", rating: 5, text: "Best purchase I've made this year. The quality is outstanding.", date: "1 week ago", verified: true },
    { name: "Emily R.", rating: 4, text: "Great value for money. Shipping was super fast too!", date: "2 weeks ago", verified: true },
    { name: "Michael T.", rating: 5, text: "My friends keep asking where I got this. Highly recommend!", date: "3 weeks ago", verified: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Link to="/store" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">TrendVault</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs text-white flex items-center justify-center font-medium"
                >
                  {cartCount}
                </motion.span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/store" className="hover:text-primary transition-colors">Store</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary/80">{product.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <ImageGallery 
            images={productImages} 
            productTitle={product.title}
          />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {discount > 0 && (
                <Badge className="bg-red-500 text-white font-bold">
                  SAVE {discount}%
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
                  TIKTOK VIRAL
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-400">
                4.9 ({Math.floor(Math.random() * 500) + 200} reviews)
              </span>
              <span className="text-sm text-emerald-400">
                • {Math.floor(Math.random() * 1000) + 500} sold
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-white">
                ${(product.price || 0).toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-xl text-slate-500 line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-emerald-400 font-medium">
                  You save ${((product.compare_at_price || 0) - (product.price || 0)).toFixed(2)}
                </span>
              )}
            </div>

            {/* Low Stock Warning */}
            {isLowStock && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3"
              >
                <span className="text-orange-400 text-sm font-medium">
                  🔥 Only {product.inventory_quantity} left in stock - order soon!
                </span>
              </motion.div>
            )}

            {/* Description */}
            <p className="text-slate-300 leading-relaxed">
              {product.description || "Experience premium quality with this carefully curated product. Designed for those who appreciate the finer things in life, this item combines functionality with stunning aesthetics."}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">Quantity:</span>
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center text-white font-medium">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/80 hover:to-cyan-500/80 text-white font-semibold h-14 text-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ${((product.price || 0) * quantity).toFixed(2)}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-14 w-14 ${isWishlisted ? 'bg-red-500/10 border-red-500/30 text-red-400' : ''}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Free Shipping</p>
                  <p className="text-slate-400 text-xs">Orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Secure Payment</p>
                  <p className="text-slate-400 text-xs">256-bit SSL</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Easy Returns</p>
                  <p className="text-slate-400 text-xs">30-day guarantee</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Fast Delivery</p>
                  <p className="text-slate-400 text-xs">2-5 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="bg-slate-900/50 border border-border p-1">
              <TabsTrigger value="description" className="data-[state=active]:bg-primary/20">
                Description
              </TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:bg-primary/20">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-primary/20">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="bg-slate-900/30 rounded-2xl border border-border p-8">
                <h3 className="text-xl font-bold text-white mb-4">Product Description</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed mb-4">
                    {product.description || "Experience the perfect blend of innovation and style with this premium product. Crafted with attention to detail, it's designed to elevate your everyday life."}
                  </p>
                  <h4 className="text-lg font-semibold text-white mt-6 mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-emerald-400" />
                      Premium quality materials for lasting durability
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-emerald-400" />
                      Ergonomic design for maximum comfort
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-emerald-400" />
                      Energy-efficient and eco-friendly
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <Check className="w-5 h-5 text-emerald-400" />
                      Perfect for home, office, or travel
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <div className="bg-slate-900/30 rounded-2xl border border-border p-8">
                <h3 className="text-xl font-bold text-white mb-6">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Category", value: product.category || "General" },
                    { label: "SKU", value: product.id.slice(0, 8).toUpperCase() },
                    { label: "Weight", value: "0.5 kg" },
                    { label: "Dimensions", value: "15 x 10 x 5 cm" },
                    { label: "Material", value: "Premium Grade" },
                    { label: "Warranty", value: "1 Year" },
                    { label: "In Stock", value: `${product.inventory_quantity || 100} units` },
                    { label: "Ships From", value: "United States" },
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-border last:border-0">
                      <span className="text-slate-400">{spec.label}</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="bg-slate-900/30 rounded-2xl border border-border p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Customer Reviews</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <span className="text-white font-medium">4.9 out of 5</span>
                      <span className="text-slate-400">• {reviews.length} reviews</span>
                    </div>
                  </div>
                  <Button className="bg-primary/20 text-primary hover:bg-primary/30">
                    Write a Review
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {reviews.map((review, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border-b border-border last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold">
                            {review.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{review.name}</span>
                              {review.verified && (
                                <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">{review.date}</span>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300">{review.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts 
            products={relatedProducts} 
            onAddToCart={(p) => addToCart(p)} 
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cart={cart}
        cartTotal={cartTotal}
      />
    </div>
  );
};

export default ProductDetail;
