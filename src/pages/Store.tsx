import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Sparkles, Zap, Gift, 
  Timer, TrendingUp, Heart, Package, ChevronRight
} from "lucide-react";
import { useSEOHead } from "@/hooks/useSEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/store/ProductCard";
import { HeroSection } from "@/components/store/HeroSection";
import { BundleSection } from "@/components/store/BundleSection";
import { FlashSaleSection } from "@/components/store/FlashSaleSection";
import { TrustBadges } from "@/components/store/TrustBadges";
import { CategoryNav } from "@/components/store/CategoryNav";
import { CartDrawer } from "@/components/store/CartDrawer";
import { UpsellModal } from "@/components/store/UpsellModal";
import { LoyaltyBanner } from "@/components/store/LoyaltyBanner";
import { SocialProofToast } from "@/components/store/SocialProofToast";
import { StoreFooter } from "@/components/store/StoreFooter";
import { EmailCapturePopup } from "@/components/store/EmailCapturePopup";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";

const Store = () => {
  useSEOHead({
    title: "Shop Viral Products & Trending Deals",
    description: "Discover curated TikTok-viral products with up to 70% off. Fast shipping, easy returns, and flash sales daily.",
  });

  const { data: products, isLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [upsellProduct, setUpsellProduct] = useState<any>(null);
  const { cart, addToCart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  const categories = products 
    ? [...new Set(products.map(p => p.category).filter(Boolean))]
    : [];

  const filteredProducts = selectedCategory 
    ? products?.filter(p => p.category === selectedCategory)
    : products;

  const handleAddToCart = (product: any) => {
    addToCart(product);
    if (product.price > 30) {
      const relatedProduct = products?.find(
        p => p.id !== product.id && p.category === product.category
      );
      if (relatedProduct) setUpsellProduct(relatedProduct);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">TrendVault</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => scrollToSection('products-section')} className="hover:text-primary transition-colors">All Products</button>
            <button onClick={() => scrollToSection('flash-sale-section')} className="hover:text-primary transition-colors flex items-center gap-1">
              <Timer className="w-4 h-4 text-red-400" />
              Flash Sales
            </button>
            <button onClick={() => scrollToSection('bundles-section')} className="hover:text-primary transition-colors flex items-center gap-1">
              <Gift className="w-4 h-4 text-purple-400" />
              Bundles
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
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

      {/* Loyalty Banner */}
      <LoyaltyBanner />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection />
        <TrustBadges />
        <FlashSaleSection products={products?.slice(0, 4) || []} onAddToCart={handleAddToCart} />
        <CategoryNav categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        <BundleSection products={products || []} onAddToCart={handleAddToCart} />

        {/* Product Grid */}
        <section id="products-section" className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedCategory || "All Products"}
              </h2>
              <p className="text-muted-foreground">
                Discover our curated collection of trending products
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                {filteredProducts?.length || 0} Products
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts?.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Newsletter / VIP Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/50 via-primary/20 to-cyan-900/50 border border-primary/20 p-12">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px]" />
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                EXCLUSIVE DEALS
              </Badge>
              <h3 className="text-4xl font-bold text-white mb-4">
                Get Early Access to Sales
              </h3>
              <p className="text-lg text-slate-300 mb-8">
                Be the first to know about flash sales, new arrivals, and exclusive discounts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <input 
                  type="email"
                  placeholder="Enter your email..."
                  className="px-6 py-4 rounded-xl bg-slate-900/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary min-w-[300px]"
                />
                <Button size="lg" className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/80 hover:to-cyan-500/80 text-white font-semibold px-8">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                🔒 We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <StoreFooter />

      {/* Cart Drawer */}
      <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cart={cart}
        cartTotal={cartTotal}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />

      {/* Upsell Modal */}
      <UpsellModal 
        product={upsellProduct} 
        onClose={() => setUpsellProduct(null)}
        onAddToCart={(p) => {
          addToCart(p);
          setUpsellProduct(null);
        }}
      />

      {/* Social Proof Toast */}
      <SocialProofToast products={products || []} />
    </div>
  );
};

export default Store;
