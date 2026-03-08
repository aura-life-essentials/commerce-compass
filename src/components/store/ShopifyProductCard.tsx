import { motion } from "framer-motion";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, ShopifyProduct } from "@/stores/cartStore";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  product: ShopifyProduct;
}

export const ShopifyProductCard = ({ product }: Props) => {
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const p = product.node;
  const firstImage = p.images?.edges?.[0]?.node;
  const variant = p.variants?.edges?.[0]?.node;
  const price = p.priceRange.minVariantPrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
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
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm truncate">{p.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-primary">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </span>
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
