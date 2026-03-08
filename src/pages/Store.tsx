import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles, TrendingUp, Package } from "lucide-react";
import { useSEOHead } from "@/hooks/useSEOHead";
import { Badge } from "@/components/ui/badge";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import { ShopifyCartDrawer } from "@/components/store/ShopifyCartDrawer";
import { TrustBadges } from "@/components/store/TrustBadges";
import { StoreFooter } from "@/components/store/StoreFooter";
import { SocialProofToast } from "@/components/store/SocialProofToast";
import { EmailCapturePopup } from "@/components/store/EmailCapturePopup";
import { LoyaltyBanner } from "@/components/store/LoyaltyBanner";
import { HeroSection } from "@/components/store/HeroSection";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Store = () => {
  useSEOHead({
    title: "Shop Viral Products & Trending Deals",
    description: "Discover curated TikTok-viral products with up to 70% off. Fast shipping, easy returns, and flash sales daily.",
  });

  const { data: products, isLoading } = useShopifyProducts(50);

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
          <ShopifyCartDrawer />
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

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md">
                Your store doesn't have any products yet. Tell us what you'd like to sell and we'll add it for you!
              </p>
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

        {/* Newsletter Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/50 via-primary/20 to-cyan-900/50 border border-primary/20 p-12">
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                EXCLUSIVE DEALS
              </Badge>
              <h3 className="text-4xl font-bold mb-4">Get Early Access to Sales</h3>
              <p className="text-lg text-muted-foreground mb-8">
                Be the first to know about flash sales, new arrivals, and exclusive discounts.
              </p>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />
      <EmailCapturePopup />
    </div>
  );
};

export default Store;
