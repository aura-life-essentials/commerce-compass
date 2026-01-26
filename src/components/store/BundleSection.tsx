import { motion } from "framer-motion";
import { Package, Sparkles, Gift, ShoppingCart, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface BundleSectionProps {
  products: any[];
  onAddToCart: (product: any) => void;
}

const bundles = [
  {
    id: "starter-pack",
    name: "Starter Essentials",
    description: "Perfect for beginners - everything you need to get started",
    discount: 35,
    icon: "🌟",
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/30",
    bgColor: "from-blue-950/40 to-cyan-950/40",
    items: ["LED Strip Lights", "Phone Mount", "Ring Light"],
    originalPrice: 74.97,
    bundlePrice: 48.73,
    savings: 26.24,
    popular: false,
  },
  {
    id: "creator-bundle",
    name: "Content Creator Pro",
    description: "Go viral with this TikTok-approved creator kit",
    discount: 45,
    icon: "🎬",
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500/30",
    bgColor: "from-purple-950/40 to-pink-950/40",
    items: ["Galaxy Projector", "Ring Light", "Portable Blender"],
    originalPrice: 114.97,
    bundlePrice: 63.23,
    savings: 51.74,
    popular: true,
  },
  {
    id: "home-upgrade",
    name: "Home Upgrade Kit",
    description: "Transform your space into a smart oasis",
    discount: 40,
    icon: "🏠",
    color: "from-emerald-500 to-teal-500",
    borderColor: "border-emerald-500/30",
    bgColor: "from-emerald-950/40 to-teal-950/40",
    items: ["Galaxy Projector", "Sunrise Clock", "LED Strips"],
    originalPrice: 119.97,
    bundlePrice: 71.98,
    savings: 47.99,
    popular: false,
  },
];

export const BundleSection = ({ products, onAddToCart }: BundleSectionProps) => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5">
            <Gift className="w-3 h-3 mr-1" />
            BUNDLE & SAVE
          </Badge>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Curated Bundles
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto"
        >
          Save up to 45% when you buy our handpicked product bundles. 
          Designed for maximum value and perfect combinations.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {bundles.map((bundle, index) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative overflow-hidden bg-gradient-to-br ${bundle.bgColor} border ${bundle.borderColor} hover:scale-[1.02] transition-all duration-300 h-full`}>
              {/* Popular Badge */}
              {bundle.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bundle.color} flex items-center justify-center text-3xl shadow-lg`}>
                    {bundle.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{bundle.name}</h3>
                    <p className="text-sm text-slate-400">{bundle.description}</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {bundle.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="p-4 rounded-xl bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Original Price:</span>
                    <span className="text-slate-500 line-through">${bundle.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bundle Price:</span>
                    <span className="text-2xl font-bold text-white">${bundle.bundlePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-primary">
                    <span className="font-medium">You Save:</span>
                    <span className="font-bold">${bundle.savings.toFixed(2)} ({bundle.discount}%)</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full bg-gradient-to-r ${bundle.color} hover:opacity-90 text-white font-semibold py-6 text-lg`}
                  onClick={() => {
                    // Add all bundle items to cart
                    bundle.items.forEach((_, i) => {
                      if (products[i]) onAddToCart(products[i]);
                    });
                  }}
                >
                  <Package className="w-5 h-5 mr-2" />
                  Add Bundle to Cart
                </Button>

                <p className="text-xs text-center text-slate-500">
                  Free shipping included • 30-day returns
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
