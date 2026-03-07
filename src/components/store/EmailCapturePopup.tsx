import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Gift, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const POPUP_DISMISSED_KEY = "trendvault_popup_dismissed";
const POPUP_DELAY_MS = 15000; // 15 seconds

export const EmailCapturePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dismiss = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem(POPUP_DISMISSED_KEY, "true");
  }, []);

  // Timed trigger
  useEffect(() => {
    if (sessionStorage.getItem(POPUP_DISMISSED_KEY)) return;

    const timer = setTimeout(() => setIsOpen(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Exit intent trigger (desktop only)
  useEffect(() => {
    if (sessionStorage.getItem(POPUP_DISMISSED_KEY)) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);
    // Simulate submission — replace with actual API call
    await new Promise((r) => setTimeout(r, 800));
    toast.success("You're in! Check your email for exclusive deals 🎉");
    setIsSubmitting(false);
    dismiss();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-primary/20 shadow-2xl">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/15 rounded-full blur-[80px] pointer-events-none" />

              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 p-8 text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                  <Gift className="w-8 h-8 text-white" />
                </div>

                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-4">
                  <Sparkles className="w-3 h-3 mr-1" />
                  EXCLUSIVE OFFER
                </Badge>

                <h3 className="text-2xl font-bold text-white mb-2">
                  Get 10% Off Your First Order
                </h3>
                <p className="text-slate-400 mb-6">
                  Join our list for early access to flash sales, new drops, and exclusive discounts.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="Enter your email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/80 hover:to-cyan-500/80 text-white font-semibold py-6 text-lg"
                  >
                    {isSubmitting ? "Joining..." : "Unlock 10% Off"}
                  </Button>
                </form>

                <button
                  onClick={dismiss}
                  className="mt-4 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
