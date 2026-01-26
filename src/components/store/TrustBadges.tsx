import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, CreditCard, Headphones, Star } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Orders over $25",
    color: "text-cyan-400",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encrypted",
    color: "text-emerald-400",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day guarantee",
    color: "text-purple-400",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Always here to help",
    color: "text-orange-400",
  },
  {
    icon: Star,
    title: "4.9 Rating",
    description: "50k+ happy customers",
    color: "text-yellow-400",
  },
  {
    icon: CreditCard,
    title: "Pay Later",
    description: "Buy now, pay in 4",
    color: "text-pink-400",
  },
];

export const TrustBadges = () => {
  return (
    <section className="border-y border-border bg-slate-900/30 py-6 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-8 overflow-x-auto scrollbar-hide">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 min-w-[180px]"
            >
              <div className={`w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center ${badge.color}`}>
                <badge.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-white text-sm whitespace-nowrap">{badge.title}</p>
                <p className="text-xs text-slate-400 whitespace-nowrap">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
