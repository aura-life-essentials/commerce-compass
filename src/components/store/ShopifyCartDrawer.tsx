import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPricingSnapshot } from "@/lib/pricing";
import { toStripeCheckoutItem } from "@/lib/shopify";
import { useAuthContext } from "@/contexts/AuthContext";

export const ShopifyCartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user } = useAuthContext();
  const { items, isLoading, isSyncing, updateQuantity, removeItem, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const pricing = getPricingSnapshot(
      Number.parseFloat(item.price.amount),
      item.compareAtPrice?.amount ? Number.parseFloat(item.compareAtPrice.amount) : undefined,
    );
    return sum + pricing.optimizedPrice * item.quantity;
  }, 0);

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = async () => {
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(toStripeCheckoutItem),
          customerEmail: user?.email,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      window.open(data.url, '_blank');
      setIsOpen(false);
      toast.success('Secure Stripe checkout opened');
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} queued for checkout`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col pt-6">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {items.map((item) => {
                    const pricing = getPricingSnapshot(
                      Number.parseFloat(item.price.amount),
                      item.compareAtPrice?.amount ? Number.parseFloat(item.compareAtPrice.amount) : undefined,
                    );

                    return (
                      <div key={item.variantId} className="flex gap-4 p-2">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary/20">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-medium">{item.product.node.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.selectedOptions.map((o) => o.value).join(' • ')}</p>
                          <div className="font-semibold text-primary">{item.price.currencyCode} {pricing.optimizedPrice.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">
                            Margin-safe floor {item.price.currencyCode} {pricing.marginFloorPrice.toFixed(2)}
                          </div>
                          {pricing.competitorPrice > pricing.optimizedPrice && (
                            <div className="text-xs text-muted-foreground line-through">
                              {item.price.currencyCode} {pricing.competitorPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-shrink-0 flex-col items-end gap-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.variantId)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-shrink-0 space-y-4 border-t bg-background pt-4">
                <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Every cart line now keeps a protected profit floor, stays only slightly under the market anchor, and lands in your Stripe checkout.
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold">{items[0]?.price.currencyCode || '$'} {subtotal.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full" size="lg" disabled={items.length === 0 || isLoading || isSyncing || isCheckingOut}>
                  {isLoading || isSyncing || isCheckingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Checkout with Stripe
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
