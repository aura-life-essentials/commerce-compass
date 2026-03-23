import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, Send, Loader2, Package, DollarSign,
  ShoppingCart, Tag, BarChart3, RefreshCw,
  Mic, MicOff, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommandResult {
  id: string;
  command: string;
  action: string;
  status: "success" | "error" | "pending";
  data: any;
  timestamp: Date;
}

const QUICK_COMMANDS = [
  { label: "Store Status", action: "status_report", icon: Store, description: "Full status report" },
  { label: "All Products", action: "list_products", icon: Package, description: "List live products" },
  { label: "Recent Orders", action: "list_orders", icon: ShoppingCart, description: "View latest orders" },
  { label: "Collections", action: "list_collections", icon: Tag, description: "Browse collections" },
  { label: "Shop Info", action: "shop_info", icon: BarChart3, description: "Store configuration" },
];

export const ShopifyCommandCenter = () => {
  const [command, setCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CommandResult[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const parseNaturalCommand = (input: string): { action: string; params: any } => {
    const lower = input.toLowerCase().trim();

    // Status / overview
    if (lower.match(/status|overview|report|how.*store/)) {
      return { action: "status_report", params: {} };
    }

    // List products
    if (lower.match(/list.*product|show.*product|all.*product|get.*product/)) {
      return { action: "list_products", params: { limit: 50 } };
    }

    // List orders
    if (lower.match(/list.*order|show.*order|recent.*order|get.*order/)) {
      return { action: "list_orders", params: { status: "any", limit: 20 } };
    }

    // Create product
    const createMatch = lower.match(/create.*product.*(?:called?|named?)\s+["']?(.+?)["']?\s+(?:at|for|price[d]?)\s+\$?(\d+\.?\d*)/);
    if (createMatch) {
      return {
        action: "create_product",
        params: {
          product: {
            title: createMatch[1].trim(),
            status: "active",
            variants: [{ price: createMatch[2], inventory_management: "shopify" }],
          },
        },
      };
    }
    if (lower.match(/create.*product|add.*product|new.*product/)) {
      return {
        action: "create_product",
        params: {
          product: {
            title: input.replace(/create|add|new|product|a|the/gi, "").trim() || "New Product",
            status: "active",
            variants: [{ price: "29.99", inventory_management: "shopify" }],
          },
        },
      };
    }

    // Bulk price adjust
    const priceUpMatch = lower.match(/(?:raise|increase|up).*price.*(\d+)%/);
    if (priceUpMatch) {
      return { action: "bulk_price_adjust", params: { adjustment_type: "percentage_increase", value: parseFloat(priceUpMatch[1]) } };
    }
    const priceDownMatch = lower.match(/(?:lower|decrease|drop|reduce|discount).*price.*(\d+)%/);
    if (priceDownMatch) {
      return { action: "bulk_price_adjust", params: { adjustment_type: "percentage_decrease", value: parseFloat(priceDownMatch[1]) } };
    }

    // Create discount
    const discountMatch = lower.match(/(?:create|make|add).*discount.*(\d+)%.*code\s+["']?(\w+)["']?/);
    if (discountMatch) {
      return {
        action: "create_discount",
        params: {
          code: discountMatch[2].toUpperCase(),
          price_rule: {
            title: `${discountMatch[1]}% OFF - ${discountMatch[2].toUpperCase()}`,
            target_type: "line_item",
            target_selection: "all",
            allocation_method: "across",
            value_type: "percentage",
            value: `-${discountMatch[1]}`,
            customer_selection: "all",
            starts_at: new Date().toISOString(),
          },
        },
      };
    }

    // Collections
    if (lower.match(/collection|categor/)) {
      return { action: "list_collections", params: {} };
    }

    // Shop info
    if (lower.match(/shop.*info|store.*info|settings/)) {
      return { action: "shop_info", params: {} };
    }

    // Default: status
    return { action: "status_report", params: {} };
  };

  const executeCommand = useCallback(async (action: string, params: any = {}, label?: string) => {
    setIsLoading(true);
    const resultId = crypto.randomUUID();

    try {
      const { data, error } = await supabase.functions.invoke("shopify-admin", {
        body: { action, ...params },
      });

      if (error) throw error;

      const newResult: CommandResult = {
        id: resultId,
        command: label || action,
        action,
        status: data?.success ? "success" : "error",
        data: data?.data || data,
        timestamp: new Date(),
      };

      setResults(prev => [newResult, ...prev].slice(0, 20));
      setExpandedResult(resultId);

      if (data?.success) {
        toast.success(`✅ ${label || action} completed`);
      } else {
        toast.error(`❌ ${data?.error || "Command failed"}`);
      }
    } catch (err: any) {
      setResults(prev => [{
        id: resultId,
        command: label || action,
        action,
        status: "error",
        data: { error: err.message },
        timestamp: new Date(),
      }, ...prev].slice(0, 20));
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = () => {
    if (!command.trim()) return;
    const { action, params } = parseNaturalCommand(command);
    executeCommand(action, params, command);
    setCommand("");
  };

  const handleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCommand(transcript);
      setTimeout(() => {
        const { action, params } = parseNaturalCommand(transcript);
        executeCommand(action, params, `🎤 ${transcript}`);
        setCommand("");
      }, 300);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed");
    };
    recognition.start();
  };

  const renderResultData = (result: CommandResult) => {
    const d = result.data;
    if (!d) return <p className="text-sm text-muted-foreground">No data returned</p>;

    if (result.action === "status_report") {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{d.product_count || 0}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div className="rounded-lg bg-accent/10 p-3 text-center">
              <p className="text-2xl font-bold text-accent-foreground">{d.recent_orders || 0}</p>
              <p className="text-xs text-muted-foreground">Recent Orders</p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3 text-center">
              <p className="text-2xl font-bold">{d.collections?.smart || 0}</p>
              <p className="text-xs text-muted-foreground">Smart Collections</p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-3 text-center">
              <p className="text-2xl font-bold">{d.collections?.custom || 0}</p>
              <p className="text-xs text-muted-foreground">Custom Collections</p>
            </div>
          </div>
          {d.products && (
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {d.products.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2 text-sm">
                  <span className="font-medium">{p.title}</span>
                  <div className="flex items-center gap-2">
                    {p.variants?.map((v: any) => (
                      <Badge key={v.id} variant="outline" className="text-xs">
                        ${v.price} ({v.inventory ?? "?"} in stock)
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (result.action === "list_products" && d.products) {
      return (
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {d.products.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{p.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">{p.product_type}</span>
              </div>
              <Badge variant="outline">${p.variants?.[0]?.price || "?"}</Badge>
            </div>
          ))}
        </div>
      );
    }

    if (result.action === "list_orders" && d.orders) {
      return (
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {d.orders.map((o: any) => (
            <div key={o.id} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2 text-sm">
              <div>
                <span className="font-medium">#{o.order_number || o.name}</span>
                <span className="ml-2 text-muted-foreground">{o.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={o.financial_status === "paid" ? "border-primary/30 text-primary" : ""}>
                  {o.financial_status}
                </Badge>
                <span className="font-semibold">${o.total_price}</span>
              </div>
            </div>
          ))}
          {(!d.orders?.length) && <p className="py-4 text-center text-muted-foreground">No orders found</p>}
        </div>
      );
    }

    if (result.action === "bulk_price_adjust" && d.adjustments) {
      return (
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {d.adjustments.map((a: any, i: number) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/20 px-3 py-2 text-sm">
              <span>{a.product} ({a.variant})</span>
              <span>${a.old} → <span className="font-bold text-primary">${a.new}</span></span>
            </div>
          ))}
        </div>
      );
    }

    // Generic JSON display
    return (
      <pre className="max-h-60 overflow-auto rounded-lg bg-secondary/20 p-3 text-xs">
        {JSON.stringify(d, null, 2)}
      </pre>
    );
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-card/40 shadow-[var(--shadow-lg)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Shopify Command Center</h3>
          <p className="text-xs text-muted-foreground">Full Admin API • Type or speak commands</p>
        </div>
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
          <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
          LIVE
        </Badge>
      </div>

      {/* Command Input */}
      <div className="border-b border-border/40 p-4">
        <div className="relative">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder='Try: "show all products" • "raise prices 10%" • "create discount 20% code SUMMER"'
            className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 pr-24 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 ${isListening ? "bg-destructive/20 text-destructive" : ""}`}
              onClick={handleVoice}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={isLoading || !command.trim()}
              className="h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_COMMANDS.map((cmd) => (
            <Button
              key={cmd.action}
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              disabled={isLoading}
              onClick={() => executeCommand(cmd.action, {}, cmd.label)}
            >
              <cmd.icon className="h-3 w-3" />
              {cmd.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Feed */}
      <div className="max-h-[500px] overflow-y-auto p-4">
        {results.length === 0 ? (
          <div className="py-12 text-center">
            <Store className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Command your Shopify store</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Type natural language commands or use quick actions above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {results.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-border/40 bg-secondary/10"
                >
                  <button
                    onClick={() => setExpandedResult(expandedResult === result.id ? null : result.id)}
                    className="flex w-full items-center gap-3 p-3 text-left"
                  >
                    {result.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <span className="flex-1 truncate text-sm font-medium">{result.command}</span>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                    {expandedResult === result.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedResult === result.id && (
                    <div className="border-t border-border/30 p-3">
                      {renderResultData(result)}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  );
};
