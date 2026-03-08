import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useShopifyProductByHandle, useShopifyProducts } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShopifyCartDrawer } from "@/components/store/ShopifyCartDrawer";
import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import { StoreFooter } from "@/components/store/StoreFooter";
import {
  ArrowLeft, ShoppingCart, Loader2, Zap, Minus, Plus,
  Truck, Shield, RotateCcw, Star, Check, Package, TrendingUp
} from "lucide-react";
import { ShopifyProductCard } from "@/components/store/ShopifyProductCard";
import { StoreFooter } from "@/components/store/StoreFooter";
import {
  ArrowLeft, ShoppingCart, Loader2, Zap, Minus, Plus,
  Truck, Shield, RotateCcw, Star, Check, Package
} from "lucide-react";
import { toast } from "sonner";

const ShopifyProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading } = useShopifyProductByHandle(handle || "");
  const { data: allProducts } = useShopifyProducts(50);
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
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/store"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to Store</Button></Link>
      </div>
    );
  }

  const variant = product.variants?.edges?.[selectedVariantIndex]?.node;
  const images = product.images?.edges || [];
  const relatedProducts = allProducts?.filter(p => p.node.handle !== handle)?.slice(0, 4) || [];

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
    toast.success(`${product.title} added to cart!`, { position: 'top-center' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/store" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">TrendVault</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/store" className="text-muted-foreground hover:text-foreground transition-colors">Products</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </nav>
          <ShopifyCartDrawer />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/store" className="hover:text-primary transition-colors">Store</Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-secondary/20 mb-4 border border-border"
            >
              {images[selectedImage]?.node ? (
                <img
                  src={images[selectedImage].node.url}
                  alt={images[selectedImage].node.altText || product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ShoppingCart className="w-16 h-16" />
                </div>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      i === selectedImage ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">
                <TrendingUp className="w-3 h-3 mr-1" /> Trending
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {variant && (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {variant.price.currencyCode} {parseFloat(variant.price.amount).toFixed(2)}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {variant.availableForSale ? 'In Stock' : 'Sold Out'}
                </Badge>
              </div>
            )}

            {/* Variant selection */}
            {product.options?.filter((o: any) => o.name !== "Title").map((option: any) => (
              <div key={option.name}>
                <label className="text-sm font-medium mb-2 block">{option.name}</label>
                <div className="flex gap-2 flex-wrap">
                  {option.values.map((val: string) => {
                    const idx = product.variants.edges.findIndex((v: any) =>
                      v.node.selectedOptions.some((o: any) => o.name === option.name && o.value === val)
                    );
                    const isSelected = product.variants.edges[idx]?.node?.id === variant?.id;
                    return (
                      <Button
                        key={val}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="rounded-xl"
                        onClick={() => idx >= 0 && setSelectedVariantIndex(idx)}
                      >
                        {val}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setQuantity(q => q + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 gap-2"
              onClick={handleAddToCart}
              disabled={cartLoading || !variant?.availableForSale}
            >
              {cartLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              {variant?.availableForSale ? "Add to Cart" : "Sold Out"}
            </Button>

            {/* Trust Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders $25+' },
                { icon: Shield, label: 'Secure Pay', sub: 'SSL Encrypted' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '30-Day Policy' },
              ].map(f => (
                <Card key={f.label} className="p-3 bg-muted/20 border-border text-center">
                  <f.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.sub}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <motion.div
                  key={p.node.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ShopifyProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter />
    </div>
  );
};

export default ShopifyProductDetail;
