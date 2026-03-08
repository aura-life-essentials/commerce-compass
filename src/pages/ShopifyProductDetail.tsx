import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useShopifyProductByHandle } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyCartDrawer } from "@/components/store/ShopifyCartDrawer";
import { ArrowLeft, ShoppingCart, Loader2, Zap, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

const ShopifyProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading } = useShopifyProductByHandle(handle || "");
  const addItem = useCartStore(state => state.addItem);
  const cartLoading = useCartStore(state => state.isLoading);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/store"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to Store</Button></Link>
      </div>
    );
  }

  const variant = product.variants?.edges?.[selectedVariantIndex]?.node;
  const images = product.images?.edges || [];

  const handleAddToCart = async () => {
    if (!variant) return;
    await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success(`${product.title} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/store" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">TrendVault</span>
          </Link>
          <ShopifyCartDrawer />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link to="/store" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/20 mb-4">
              {images[selectedImage]?.node ? (
                <img src={images[selectedImage].node.url} alt={images[selectedImage].node.altText || product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="w-16 h-16" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {variant && (
              <p className="text-3xl font-bold text-primary mb-6">
                {variant.price.currencyCode} {parseFloat(variant.price.amount).toFixed(2)}
              </p>
            )}

            {/* Variant selection */}
            {product.options?.filter((o: any) => o.name !== "Title").map((option: any) => (
              <div key={option.name} className="mb-4">
                <label className="text-sm font-medium mb-2 block">{option.name}</label>
                <div className="flex gap-2 flex-wrap">
                  {option.values.map((val: string, vi: number) => (
                    <Badge
                      key={val}
                      variant={product.variants.edges[vi]?.node?.id === variant?.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const idx = product.variants.edges.findIndex((v: any) =>
                          v.node.selectedOptions.some((o: any) => o.name === option.name && o.value === val)
                        );
                        if (idx >= 0) setSelectedVariantIndex(idx);
                      }}
                    >
                      {val}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="w-3 h-3" /></Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}><Plus className="w-3 h-3" /></Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleAddToCart}
              disabled={cartLoading || !variant?.availableForSale}
            >
              {cartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              {variant?.availableForSale ? "Add to Cart" : "Sold Out"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopifyProductDetail;
