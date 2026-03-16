import { motion } from "framer-motion";
import { Package, Gift, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getPricingSnapshot } from "@/lib/pricing";

interface BundleSectionProps {
  products: any[];
  onAddToCart: (product: any) => void;
}

const bundleBlueprints = [
  {
    id: "creator-bundle",
    name: "Creator Conversion Kit",
    description: "High-visual products bundled to raise AOV without losing margin.",
    icon: "🎬",
    keywords: ["projector", "earbuds", "led"],
    popular: true,
  },
  {
    id: "wellness-bundle",
    name: "Wellness Profit Stack",
    description: "Recovery and posture products packaged for a higher-value checkout.",
    icon: "💪",
    keywords: ["massage", "posture", "alarm"],
  },
  {
    id: "home-bundle",
    name: "Home Upgrade Bundle",
    description: "A practical home-tech mix positioned just below category leaders.",
    icon: "🏠",
    keywords: ["blender", "projector", "lights"],
  },
];

export const BundleSection = ({ products, onAddToCart }: BundleSectionProps) => {
  const bundles = bundleBlueprints
    .map((bundle) => {
      const matchedProducts = bundle.keywords
        .map((keyword) => products.find((product) => product.node.title.toLowerCase().includes(keyword)))
        .filter(Boolean)
        .slice(0, 3);

      if (matchedProducts.length < 2) return null;

      const productPricing = matchedProducts.map((product) => {
        const variant = product.node.variants?.edges?.[0]?.node;
        const pricing = getPricingSnapshot(
          Number.parseFloat(variant?.price.amount || product.node.priceRange.minVariantPrice.amount),
          variant?.compareAtPrice?.amount ? Number.parseFloat(variant.compareAtPrice.amount) : undefined,
        );
        return { product, pricing };
      });

      const originalPrice = productPricing.reduce((sum, item) => sum + item.pricing.optimizedPrice, 0);
      const protectedFloor = productPricing.reduce((sum, item) => sum + item.pricing.marginFloorPrice, 0);
      const targetBundlePrice = Number((originalPrice * 0.94).toFixed(2));
      const bundlePrice = Number(Math.max(targetBundlePrice, protectedFloor).toFixed(2));
      const savings = Number((originalPrice - bundlePrice).toFixed(2));
      const discount = originalPrice > 0 ? Math.max(0, Math.round((savings / originalPrice) * 100)) : 0;

      return {
        ...bundle,
        matchedProducts,
        originalPrice,
        bundlePrice,
        savings,
        discount,
      };
    })
    .filter(Boolean);

  if (!bundles.length) return null;

  return (
    <section id="bundles-section" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <Badge className="bg-primary/15 text-primary border-primary/30 px-4 py-1.5">
            <Gift className="w-3 h-3 mr-1" />
            BUNDLE & SCALE AOV
          </Badge>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold mb-4"
        >
          Curated Profit Bundles
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Each bundle is stacked for better revenue per checkout while staying slightly under market anchors.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {bundles.map((bundle: any, index) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden bg-card/70 border border-border hover:border-primary/30 transition-all duration-300 h-full">
              {bundle.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 text-3xl flex items-center justify-center shadow-lg">
                    {bundle.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{bundle.name}</h3>
                    <p className="text-sm text-muted-foreground">{bundle.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {bundle.matchedProducts.map((product: any) => (
                    <div key={product.node.id} className="flex items-center gap-2 text-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">{product.node.title}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Sold separately</span>
                    <span className="line-through">${bundle.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bundle price</span>
                    <span className="text-2xl font-bold text-primary">${bundle.bundlePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-primary">
                    <span className="font-medium">Bundle edge</span>
                    <span className="font-bold">Save ${bundle.savings.toFixed(2)} ({bundle.discount}%)</span>
                  </div>
                </div>

                <Button
                  className="w-full font-semibold py-6 text-lg"
                  onClick={() => {
                    bundle.matchedProducts.forEach((product: any) => onAddToCart(product));
                  }}
                >
                  <Package className="w-5 h-5 mr-2" />
                  Add Bundle to Cart
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
