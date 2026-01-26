import { motion } from "framer-motion";
import { Crown, Star, Gift, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LoyaltyBanner = () => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20 border-b border-yellow-500/20"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="w-4 h-4 text-yellow-400" />
            </motion.div>
            <span className="text-yellow-300 font-medium">VIP REWARDS</span>
          </div>
          
          <span className="hidden sm:inline text-slate-400">|</span>
          
          <span className="hidden sm:inline text-slate-300">
            <Star className="w-3 h-3 text-yellow-400 inline mr-1" />
            Earn 5% back on every purchase
          </span>
          
          <span className="text-slate-400">|</span>
          
          <span className="text-slate-300">
            <Gift className="w-3 h-3 text-pink-400 inline mr-1" />
            Free birthday gift
          </span>
          
          <Button
            variant="link"
            className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
          >
            Join Free <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
