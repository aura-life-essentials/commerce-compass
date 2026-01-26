import { motion } from "framer-motion";
import { 
  Laptop, Home, Camera, Car, Sparkles, Shirt, 
  Headphones, Watch, Gift, Grid
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryNavProps {
  categories: (string | null)[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const categoryIcons: Record<string, any> = {
  "Electronics": Laptop,
  "Home & Living": Home,
  "Photography": Camera,
  "Automotive": Car,
  "Beauty": Sparkles,
  "Fashion": Shirt,
  "Audio": Headphones,
  "Watches": Watch,
  "Kitchen": Gift,
};

export const CategoryNav = ({ categories, selected, onSelect }: CategoryNavProps) => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant={selected === null ? "default" : "outline"}
            className={`rounded-full px-6 whitespace-nowrap ${
              selected === null 
                ? "bg-gradient-to-r from-primary to-cyan-500 text-white border-0" 
                : "border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
            onClick={() => onSelect(null)}
          >
            <Grid className="w-4 h-4 mr-2" />
            All Products
          </Button>
        </motion.div>

        {categories.filter(Boolean).map((category) => {
          const Icon = categoryIcons[category as string] || Sparkles;
          const isSelected = selected === category;
          
          return (
            <motion.div 
              key={category}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={isSelected ? "default" : "outline"}
                className={`rounded-full px-6 whitespace-nowrap ${
                  isSelected 
                    ? "bg-gradient-to-r from-primary to-cyan-500 text-white border-0" 
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
                onClick={() => onSelect(category)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
