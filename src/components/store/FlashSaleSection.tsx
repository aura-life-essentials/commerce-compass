import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Timer, Zap, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FlashSaleProps {
  products: any[];
  onAddToCart: (product: any) => void;
}

export const FlashSaleSection = ({ products, onAddToCart }: FlashSaleProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 45, seconds: 30 }; // Reset timer
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  if (products.length === 0) return null;

  return (
    <section id="flash-sale-section" className="container mx-auto px-4 py-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/50 via-orange-950/50 to-yellow-950/50 border border-red-500/20 p-8">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] opacity-10"
            style={{ background: "conic-gradient(from 0deg, transparent, #ef4444, transparent)" }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
              >
                <Zap className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  Flash Sale
                  <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
                </h2>
                <p className="text-orange-300/80">Limited time deals — grab them before they're gone!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-orange-400" />
              <div className="flex gap-2">
                {[
                  { value: timeLeft.hours, label: "HRS" },
                  { value: timeLeft.minutes, label: "MIN" },
                  { value: timeLeft.seconds, label: "SEC" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-slate-900/80 rounded-xl px-4 py-3 min-w-[70px] text-center">
                      <span className="text-2xl font-bold text-white font-mono">{formatTime(item.value)}</span>
                      <p className="text-xs text-orange-400">{item.label}</p>
                    </div>
                    {i < 2 && <span className="text-2xl text-orange-400">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((product, index) => {
              const imageUrl = Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";
              
              const salePrice = product.compare_at_price 
                ? product.price 
                : +(product.price * 0.55).toFixed(2);
              const originalPrice = product.compare_at_price || product.price;
              const discount = Math.round((1 - salePrice / originalPrice) * 100);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group overflow-hidden bg-slate-900/60 border-slate-700 hover:border-orange-500/50 transition-all">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold text-lg px-3 py-1">
                        -{discount}%
                      </Badge>

                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="absolute top-3 right-3"
                      >
                        <Badge className="bg-orange-500 text-white">🔥 HOT</Badge>
                      </motion.div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h4 className="font-semibold text-white line-clamp-1">{product.title}</h4>

                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-orange-400">${salePrice.toFixed(2)}</span>
                        <span className="text-sm text-slate-500 line-through">${originalPrice.toFixed(2)}</span>
                      </div>

                      <Button
                        onClick={() => onAddToCart(product)}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Grab Deal
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
