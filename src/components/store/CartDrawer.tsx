import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2, Gift, Zap, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
}

export const CartDrawer = ({ 
  open, 
  onClose, 
  cart, 
  cartTotal,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const shipping = cartTotal > 25 ? 0 : 4.99;
  const orderTotal = cartTotal + shipping;
  const savings = cartTotal * 0.15; // Simulated savings

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            title: item.title,
            price: item.price,
          })),
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Checkout opened in new tab!");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("[CART] Checkout error:", error);
      toast.error(error.message || "Failed to create checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">Your Cart</h2>
                <Badge variant="outline" className="text-primary border-primary/30">
                  {cart.length} items
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Free Shipping Progress */}
            {cartTotal < 25 && cartTotal > 0 && (
              <div className="p-4 bg-primary/10 border-b border-primary/20">
                <div className="flex items-center gap-2 text-sm text-primary mb-2">
                  <Gift className="w-4 h-4" />
                  <span>Add ${(25 - cartTotal).toFixed(2)} more for FREE shipping!</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((cartTotal / 25) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-primary to-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Your cart is empty</h3>
                  <p className="text-slate-400 text-sm mb-4">Add some products to get started!</p>
                  <Button onClick={onClose} className="bg-primary hover:bg-primary/80">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="flex gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700"
                  >
                    <div className="w-20 h-20 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm line-clamp-2">{item.title}</h4>
                      <p className="text-primary font-semibold mt-1">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="w-7 h-7 rounded-full border-slate-600"
                            onClick={() => onUpdateQuantity?.(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white font-medium w-6 text-center">{item.quantity}</span>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="w-7 h-7 rounded-full border-slate-600"
                            onClick={() => onUpdateQuantity?.(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="w-7 h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => onRemoveItem?.(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-800 p-4 space-y-4">
                {/* Promo Code */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button variant="outline" className="border-slate-700 text-slate-300">
                    Apply
                  </Button>
                </div>

                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-primary" : ""}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-primary font-medium">
                    <span>You Save</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/80 hover:to-cyan-500/80 text-white font-semibold py-6 text-lg disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Secure Checkout
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Express Checkout
                  </span>
                  <span>•</span>
                  <span>SSL Secure</span>
                  <span>•</span>
                  <span>30-Day Returns</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
