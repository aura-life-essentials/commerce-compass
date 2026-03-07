import { motion } from "framer-motion";
import { Sparkles, Zap, Star, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const HeroSection = () => {
  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  const scrollToFlashSale = () => {
    const el = document.getElementById('flash-sale-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950/50 to-cyan-950/50" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px]"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[150px]"
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: `${Math.random() * 100}%`, y: "110%", scale: Math.random() * 0.5 + 0.5, opacity: 0.3 }}
            animate={{ y: "-5%", opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, delay: Math.random() * 5 }}
            className="absolute"
          >
            <Sparkles className="w-4 h-4 text-primary/50" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1.5 text-sm cursor-pointer" onClick={scrollToFlashSale}>
                <Zap className="w-3 h-3 mr-1" />
                FLASH SALE LIVE
              </Badge>
              <Badge variant="outline" className="text-primary border-primary/30">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                Top Rated
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-white">Discover</span>
              <br />
              <span className="text-gradient">Viral Products</span>
              <br />
              <span className="text-white">Before Anyone</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-400 mb-8 max-w-lg"
            >
              Curated TikTok-viral products with up to 70% off. 
              Fast shipping, easy returns, and real customer reviews.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/80 hover:to-cyan-500/80 text-white font-semibold px-8 h-14 text-lg group"
                onClick={scrollToProducts}
              >
                Shop Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-700 text-white hover:bg-slate-800 h-14 px-8 text-lg"
                onClick={scrollToFlashSale}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Today's Deals
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex items-center gap-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Trusted Store</p>
                  <p className="text-xs text-slate-400">Secure checkout & fast shipping</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Featured Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative z-20 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600"
                    alt="Featured trending product"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="bg-red-500 text-white mb-3">🔥 TRENDING NOW</Badge>
                    <h3 className="text-2xl font-bold text-white mb-2">LED Galaxy Projector</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-primary">$49.99</span>
                      <span className="text-lg text-slate-400 line-through">$89.99</span>
                      <Badge className="bg-primary/20 text-primary border-primary/30">-44%</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-4 -right-4 z-30 glass rounded-2xl p-4 border border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Top Rated</p>
                    <p className="text-xs text-slate-400">Best sellers</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 z-30 glass rounded-2xl p-4 border border-cyan-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Free Shipping</p>
                    <p className="text-xs text-slate-400">Orders over $25</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
