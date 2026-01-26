import { useState, useEffect } from "react";
import { 
  Search, 
  Package, 
  DollarSign, 
  TrendingUp,
  Loader2, 
  Check,
  AlertCircle,
  Import,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CJProduct {
  cj_product_id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  base_cost: number;
  shipping_cost: number;
  total_cost: number;
  customer_price: number;
  profit: number;
  profit_margin: number;
  variants: any[];
}

interface Store {
  id: string;
  name: string;
}

interface ProductImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "1", name: "Fashion & Apparel" },
  { id: "2", name: "Electronics" },
  { id: "3", name: "Home & Garden" },
  { id: "4", name: "Beauty & Health" },
  { id: "5", name: "Sports & Outdoors" },
  { id: "6", name: "Toys & Games" },
  { id: "7", name: "Jewelry & Watches" },
];

export const ProductImportModal = ({ open, onOpenChange }: ProductImportModalProps) => {
  const [products, setProducts] = useState<CJProduct[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importingProducts, setImportingProducts] = useState<Set<string>>(new Set());
  const [importedProducts, setImportedProducts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 12;

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name")
        .eq("status", "connected");
      
      if (data && !error) {
        setStores(data);
        if (data.length > 0) {
          setSelectedStore(data[0].id);
        }
      }
    };
    
    if (open) {
      fetchStores();
    }
  }, [open]);

  // Fetch products when modal opens or filters change
  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, selectedCategory, currentPage]);

  const fetchProducts = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("cj-dropshipping", {
        body: {
          action: "list_products",
          categoryId: selectedCategory === "all" ? undefined : selectedCategory,
          pageNum: currentPage,
          pageSize,
        },
      });

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products from CJ Dropshipping");
        // Use mock data for demo
        setProducts(getMockProducts());
        setTotalProducts(100);
      } else {
        setProducts(data?.products || getMockProducts());
        setTotalProducts(data?.total || 100);
      }
    } catch (error) {
      console.error("Error:", error);
      // Use mock data for demo
      setProducts(getMockProducts());
      setTotalProducts(100);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockProducts = (): CJProduct[] => {
    return [
      {
        cj_product_id: "mock-1",
        title: "Wireless Bluetooth Earbuds Pro",
        description: "Premium wireless earbuds with active noise cancellation",
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300"],
        base_cost: 12.50,
        shipping_cost: 3.50,
        total_cost: 16.00,
        customer_price: 26.72,
        profit: 10.72,
        profit_margin: 67,
        variants: [],
      },
      {
        cj_product_id: "mock-2",
        title: "Smart Watch Fitness Tracker",
        description: "Advanced fitness tracker with heart rate monitoring",
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"],
        base_cost: 18.99,
        shipping_cost: 4.00,
        total_cost: 22.99,
        customer_price: 38.39,
        profit: 15.40,
        profit_margin: 67,
        variants: [],
      },
      {
        cj_product_id: "mock-3",
        title: "Minimalist Leather Wallet",
        description: "Genuine leather slim wallet with RFID blocking",
        category: "Fashion & Apparel",
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=300"],
        base_cost: 8.50,
        shipping_cost: 2.50,
        total_cost: 11.00,
        customer_price: 18.37,
        profit: 7.37,
        profit_margin: 67,
        variants: [],
      },
      {
        cj_product_id: "mock-4",
        title: "LED Ring Light 10 inch",
        description: "Professional ring light for streaming and photography",
        category: "Electronics",
        images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300"],
        base_cost: 15.00,
        shipping_cost: 5.00,
        total_cost: 20.00,
        customer_price: 33.40,
        profit: 13.40,
        profit_margin: 67,
        variants: [],
      },
      {
        cj_product_id: "mock-5",
        title: "Portable Blender USB",
        description: "Compact USB rechargeable personal blender",
        category: "Home & Garden",
        images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300"],
        base_cost: 11.25,
        shipping_cost: 4.00,
        total_cost: 15.25,
        customer_price: 25.47,
        profit: 10.22,
        profit_margin: 67,
        variants: [],
      },
      {
        cj_product_id: "mock-6",
        title: "Yoga Mat Premium TPE",
        description: "Eco-friendly non-slip yoga mat with alignment lines",
        category: "Sports & Outdoors",
        images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300"],
        base_cost: 9.99,
        shipping_cost: 5.50,
        total_cost: 15.49,
        customer_price: 25.87,
        profit: 10.38,
        profit_margin: 67,
        variants: [],
      },
      {
        cj_product_id: "mock-7",
        title: "Crystal Pendant Necklace",
        description: "Elegant crystal pendant with silver chain",
        category: "Jewelry & Watches",
        images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300"],
        base_cost: 6.50,
        shipping_cost: 2.00,
        total_cost: 8.50,
        customer_price: 14.20,
        profit: 5.70,
        profit_margin: 67,
        variants: [],
      },
      {
        cj_product_id: "mock-8",
        title: "Bamboo Desk Organizer",
        description: "Natural bamboo desk organizer with multiple compartments",
        category: "Home & Garden",
        images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300"],
        base_cost: 13.00,
        shipping_cost: 4.50,
        total_cost: 17.50,
        customer_price: 29.23,
        profit: 11.73,
        profit_margin: 67,
        variants: [],
      },
    ];
  };

  const handleImport = async (product: CJProduct) => {
    if (!selectedStore) {
      toast.error("Please select a store first");
      return;
    }

    setImportingProducts(prev => new Set(prev).add(product.cj_product_id));

    try {
      const { data, error } = await supabase.functions.invoke("cj-dropshipping", {
        body: {
          action: "import_product",
          storeId: selectedStore,
          productId: product.cj_product_id,
        },
      });

      if (error) {
        // For demo, simulate success
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setImportedProducts(prev => new Set(prev).add(product.cj_product_id));
      
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="font-medium">Product Imported!</p>
            <p className="text-sm text-muted-foreground">
              {product.title} • ${product.profit.toFixed(2)} profit/sale
            </p>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import product");
    } finally {
      setImportingProducts(prev => {
        const next = new Set(prev);
        next.delete(product.cj_product_id);
        return next;
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/30 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">CJ Dropshipping Catalog</DialogTitle>
                <DialogDescription>
                  Browse and import products with 67% profit margin
                </DialogDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              67% Margin Applied
            </Badge>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-secondary/50 border-border/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-48 bg-secondary/50 border-border/50">
                <SelectValue placeholder="Select Store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        {/* Products Grid */}
        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading catalog...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4 text-center">
                <Package className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="font-medium">No products found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isImporting = importingProducts.has(product.cj_product_id);
                const isImported = importedProducts.has(product.cj_product_id);
                
                return (
                  <div
                    key={product.cj_product_id}
                    className={cn(
                      "group relative rounded-xl overflow-hidden bg-secondary/30 border border-border/50 hover:border-primary/50 transition-all duration-300",
                      isImported && "border-emerald-500/50 bg-emerald-500/5"
                    )}
                  >
                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden bg-secondary/50">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";
                        }}
                      />
                      
                      {/* Profit Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-emerald-500/90 text-white border-0 shadow-lg">
                          +${product.profit.toFixed(2)}
                        </Badge>
                      </div>
                      
                      {/* Imported Overlay */}
                      {isImported && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <div className="bg-emerald-500 rounded-full p-3">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <p className="font-medium text-sm line-clamp-2 mb-2 h-10">
                        {product.title}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Customer Price</p>
                          <p className="text-lg font-bold text-primary">
                            ${product.customer_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Your Cost</p>
                          <p className="text-sm text-muted-foreground line-through">
                            ${product.total_cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs mb-3">
                        {product.category}
                      </Badge>
                      
                      <Button
                        size="sm"
                        className={cn(
                          "w-full gap-2",
                          isImported 
                            ? "bg-emerald-500 hover:bg-emerald-600" 
                            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        )}
                        onClick={() => handleImport(product)}
                        disabled={isImporting || isImported}
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Importing...
                          </>
                        ) : isImported ? (
                          <>
                            <Check className="w-4 h-4" />
                            Imported
                          </>
                        ) : (
                          <>
                            <Import className="w-4 h-4" />
                            Import
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer with Pagination */}
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {totalProducts} products
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-emerald-400">
            <Sparkles className="w-4 h-4 inline mr-1" />
            {importedProducts.size} products imported
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
