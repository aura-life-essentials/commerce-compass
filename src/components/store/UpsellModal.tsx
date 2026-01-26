import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ShoppingCart, Star, Zap, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UpsellModalProps {
  product: any;
  onClose: () => void;
  onAddToCart: (product: any) => void;
}

export const UpsellModal = ({ product, onClose, onAddToCart }: UpsellModalProps) => {
  if (!product) return null;

  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

  const bundlePrice = (product.price * 0.75).toFixed(2);

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 mx-4">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Confetti Animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      y: -20,
                      x: Math.random() * 100 + "%",
                      opacity: 1,
                      scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{ 
                      y: "100%",
                      opacity: 0
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1,
                      delay: Math.random() * 0.5,
                      repeat: Infinity
                    }}
                    className={`absolute w-2 h-2 rounded-full ${
                      ['bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500'][i % 4]
                    }`}
                  />
                ))}
              </div>

              <div className="relative p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Wait! Special Offer</h3>
                  <p className="text-slate-400">
                    Add this to your cart and save an extra 25%!
                  </p>
                </div>

                {/* Product Card */}
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700 mb-6">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs mb-2">
                      <Gift className="w-3 h-3 mr-1" />
                      EXCLUSIVE OFFER
                    </Badge>
                    <h4 className="font-semibold text-white line-clamp-2 mb-2">{product.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white">${bundlePrice}</span>
                      <span className="text-sm text-slate-500 line-through">${product.price.toFixed(2)}</span>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        -25%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2 mb-6">
                  {[
                    "Perfect companion to your purchase",
                    "Limited time bundle pricing",
                    "Free express shipping",
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-primary" />
                      {benefit}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={() => onAddToCart(product)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Yes! Add to Cart - ${bundlePrice}
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white"
                  >
                    No thanks, continue to checkout
                  </Button>
                </div>

                {/* Urgency */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-orange-400 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" />
                    Offer expires when you close this window
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
