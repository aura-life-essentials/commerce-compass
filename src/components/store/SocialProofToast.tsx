import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, MapPin } from "lucide-react";

interface SocialProofToastProps {
  products: any[];
}

const cities = [
  "New York", "Los Angeles", "London", "Tokyo", "Paris", 
  "Sydney", "Berlin", "Toronto", "Dubai", "Singapore"
];

const names = [
  "Sarah M.", "John D.", "Emma L.", "Michael R.", "Lisa K.",
  "David P.", "Anna S.", "James W.", "Maria G.", "Robert H."
];

export const SocialProofToast = ({ products }: SocialProofToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<{
    name: string;
    city: string;
    product: string;
    timeAgo: string;
  } | null>(null);

  useEffect(() => {
    if (products.length === 0) return;

    const showToast = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const minutes = Math.floor(Math.random() * 30) + 1;

      setCurrentPurchase({
        name: randomName,
        city: randomCity,
        product: randomProduct.title,
        timeAgo: `${minutes} min ago`,
      });
      setIsVisible(true);

      setTimeout(() => setIsVisible(false), 5000);
    };

    // Initial delay
    const initialTimeout = setTimeout(showToast, 10000);

    // Recurring interval
    const interval = setInterval(showToast, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [products]);

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-6 z-40 max-w-sm"
        >
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-700 backdrop-blur-xl shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">
                {currentPurchase.name} just purchased
              </p>
              <p className="text-sm text-primary font-semibold line-clamp-1">
                {currentPurchase.product}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {currentPurchase.city} • {currentPurchase.timeAgo}
              </p>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
