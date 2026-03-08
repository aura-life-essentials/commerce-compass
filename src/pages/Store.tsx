import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles, TrendingUp, Package, Search, Filter, ArrowUp } from "lucide-react";
import { useSEOHead } from "@/hooks/useSEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import { ShopifyCartDrawer } from "@/components/store/ShopifyCartDrawer";
import { TrustBadges } from "@/components/store/TrustBadges";
import { StoreFooter } from "@/components/store/StoreFooter";
import { SocialProofToast } from "@/components/store/SocialProofToast";
import { EmailCapturePopup } from "@/components/store/EmailCapturePopup";
import { LoyaltyBanner } from "@/components/store/LoyaltyBanner";
import { HeroSection } from "@/components/store/HeroSection";
import { BundleSection } from "@/components/store/BundleSection";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const Store = () => {
  useSEOHead({
    title: "TrendVault – Shop Viral Products & Trending Deals",
    description: "Discover curated TikTok-viral products with up to 70% off. Fast shipping, easy returns, and flash sales daily.",
  });

  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading } = useShopifyProducts(50, searchQuery || undefined);
  const addItem = useCartStore(state => state.addItem);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll for back-to-top button
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowBackToTop(window.scrollY > 600);
    });
  }

  const handleAddBundleProduct = async (product: any) => {
    if (!product) return;
    const variant = product.node?.variants?.edges?.[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(`${product.node.title} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Header with Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/welcome" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">TrendVault</span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-foreground transition-colors">
                Products
              </button>
              <button onClick={() => document.getElementById('bundles-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-muted-foreground hover:text-foreground transition-colors">
                Bundles
              </button>
              <Link to="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                Orders
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden sm:flex items-center relative">
                <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 h-9 text-sm bg-muted/30"
                />
              </div>
              <ShopifyCartDrawer />
            </div>
          </div>
        </div>
      </header>

      <LoyaltyBanner />

      <main className="relative z-10">
        <HeroSection />
        <TrustBadges />

        {/* Product Grid */}
        <section id="products-section" className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">All Products</h2>
              <p className="text-muted-foreground">Discover our curated collection of trending products</p>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              {products?.length || 0} Products
            </Badge>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Your store doesn't have any products yet."}
              </p>
              {searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                  <motion.div
                    key={product.node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ShopifyProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Bundles - wired to real Shopify products */}
        {products && products.length > 0 && (
          <BundleSection products={products} onAddToCart={handleAddBundleProduct} />
        )}

        {/* Upsell CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/50 via-primary/20 to-cyan-900/50 border border-primary/20 p-12"
          >
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                EXCLUSIVE DEALS
              </Badge>
              <h3 className="text-4xl font-bold mb-4">Get Early Access to Sales</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Be the first to know about flash sales, new arrivals, and exclusive discounts.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-cyan-500">
                    Contact Us <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/wishlist">
                  <Button size="lg" variant="outline">
                    View Wishlist
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <StoreFooter />
      <SocialProofToast products={products || []} />
      <EmailCapturePopup />

      {/* Back to top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              size="icon"
              className="rounded-full shadow-lg"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
