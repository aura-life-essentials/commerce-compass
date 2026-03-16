import { motion } from "framer-motion";
import { ShoppingCart, Loader2, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, ShopifyProduct } from "@/stores/cartStore";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getPricingSnapshot } from "@/lib/pricing";

interface Props {
  product: ShopifyProduct;
}

export const ShopifyProductCard = ({ product }: Props) => {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const p = product.node;
  const firstImage = p.images?.edges?.[0]?.node;
  const variant = p.variants?.edges?.[0]?.node;

  const pricing = getPricingSnapshot(
    Number.parseFloat(variant?.price.amount || p.priceRange.minVariantPrice.amount),
    variant?.compareAtPrice?.amount ? Number.parseFloat(variant.compareAtPrice.amount) : undefined,
  );

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;

    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success(`${p.title} added to cart`);
  };

  return (
    <Link to={`/product/${p.handle}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/5"
      >
        <div className="aspect-square bg-secondary/20 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage.url}
              alt={firstImage.altText || p.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2">{p.title}</h3>
            {pricing.undercutPercent > 0 && (
              <Badge variant="outline" className="border-primary/30 text-primary whitespace-nowrap">
                <TrendingDown className="w-3 h-3 mr-1" />
                {pricing.undercutPercent}% below market
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>

          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-primary">
                {variant?.price.currencyCode || pricing.basePrice} {pricing.optimizedPrice.toFixed(2)}
              </div>
              {pricing.competitorPrice > pricing.optimizedPrice && (
                <div className="text-xs text-muted-foreground">
                  <span className="line-through mr-2">{variant?.price.currencyCode || ''} {pricing.competitorPrice.toFixed(2)}</span>
                  save {variant?.price.currencyCode || '$'} {pricing.savingsAmount.toFixed(2)}
                </div>
              )}
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading || !variant?.availableForSale}
              className="gap-1"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingCart className="w-3 h-3" />}
              Add
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
