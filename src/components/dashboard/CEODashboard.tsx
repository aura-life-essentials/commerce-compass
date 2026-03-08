import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Mic, MicOff, Zap, TrendingUp, DollarSign, 
  ShoppingCart, Target, Activity, Sparkles, Play, 
  CheckCircle2, Clock, AlertTriangle, BarChart3,
  Globe, Users, Package, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCeoBrain, useVoiceCommand, CEODecision } from "@/hooks/useCeoBrain";
import { useTopProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const priorityColors = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const categoryIcons = {
  MARKETING: Globe,
  PRICING: DollarSign,
  AGENT_DEPLOYMENT: Zap,
  OPTIMIZATION: Target,
  EXPANSION: TrendingUp,
};

export const CEODashboard = () => {
  const { decisions, metrics, isThinking, think, agentBrains, runSalesNow, isRunningSalesNow } = useCeoBrain();
  const { data: topProducts } = useTopProducts(5);
  const [commandInput, setCommandInput] = useState("");
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const processCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('think') || lowerCommand.includes('analyze')) {
      think(command);
    } else if (lowerCommand.includes('revenue') || lowerCommand.includes('sales')) {
      think(`Analyze current revenue situation: ${command}`);
    } else if (lowerCommand.includes('marketing') || lowerCommand.includes('ads')) {
      think(`Marketing strategy focus: ${command}`);
    } else if (lowerCommand.includes('pricing')) {
      think(`Pricing optimization: ${command}`);
    } else {
      think(`General command: ${command}`);
    }
  }, [think]);

  const { isListening, transcript, startListening } = useVoiceCommand(processCommand);

  useEffect(() => {
    if (isThinking) {
      setPulseAnimation(true);
    } else {
      setTimeout(() => setPulseAnimation(false), 500);
    }
  }, [isThinking]);

  const handleVoiceCommand = () => {
    startListening();
    toast.info("🎤 Listening for voice command...");
  };
  const handleTextCommand = () => {
    if (commandInput.trim()) {
      think(commandInput);
      toast.success("🧠 CEO Brain processing command...");
      setCommandInput("");
    }
  };

  const handleBuyNow = async (product: any) => {
    try {
      toast.loading("Creating checkout session...");
      const productSlug = product.title.toLowerCase().replace(/\s+/g, '-');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          productId: productSlug,
          quantity: 1,
        },
      });

      toast.dismiss();
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success("Checkout opened in new tab!");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to create checkout");
    }
  };

  return (
    <div className="space-y-6">
      {/* CEO Brain Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-cyan-950 border border-emerald-500/20 p-6"
      >
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-emerald-500/10 to-transparent animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-cyan-500/10 to-transparent animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Brain Status */}
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ 
                scale: pulseAnimation ? [1, 1.1, 1] : 1,
                boxShadow: pulseAnimation 
                  ? ["0 0 0 0 rgba(16, 185, 129, 0)", "0 0 40px 10px rgba(16, 185, 129, 0.3)", "0 0 0 0 rgba(16, 185, 129, 0)"]
                  : "none"
              }}
              transition={{ duration: 1.5, repeat: pulseAnimation ? Infinity : 0 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                CEO Brain
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {isThinking ? "THINKING" : "ACTIVE"}
                </Badge>
              </h2>
              <p className="text-slate-400 text-sm">Autonomous Revenue Intelligence Engine</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  {decisions?.length || 0} decisions today
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {agentBrains?.filter(a => a.is_active).length || 0} agents active
                </span>
              </div>
            </div>
          </div>

          {/* Voice Command Interface */}
          <div className="flex-1 max-w-xl w-full">
            <div className="relative">
              <input
                type="text"
                value={transcript || commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextCommand()}
                placeholder="Give me a command, CEO..."
                className="w-full px-6 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 pr-32"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleVoiceCommand}
                  className={`${isListening ? 'text-red-400 bg-red-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  size="sm"
                  onClick={handleTextCommand}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {isListening && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-emerald-400 mt-2 flex items-center gap-1"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Listening... Speak your command
              </motion.p>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/50">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">${((metrics?.revenue || 0) / 1000).toFixed(1)}k</p>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3" /> Total Revenue
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-400">{metrics?.orders || 0}</p>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShoppingCart className="w-3 h-3" /> Orders
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-cyan-400">{metrics?.products || 0}</p>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Package className="w-3 h-3" /> Products
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">{(metrics?.conversionRate || 0).toFixed(1)}%</p>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Target className="w-3 h-3" /> Conversion
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Decisions Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              AI Strategic Decisions
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => think("Generate new growth strategy")}
              disabled={isThinking}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              {isThinking ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  New Cycle
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {decisions?.slice(0, 8).map((decision, index) => {
                const CategoryIcon = categoryIcons[decision.output_action?.category as keyof typeof categoryIcons] || Zap;
                const priority = decision.output_action?.priority || 'medium';
                
                return (
                  <motion.div
                    key={decision.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${priorityColors[priority as keyof typeof priorityColors]}`}>
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={priorityColors[priority as keyof typeof priorityColors]}>
                              {priority?.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-slate-400 border-slate-600">
                              {decision.output_action?.category}
                            </Badge>
                            <span className="text-xs text-slate-500 ml-auto">
                              {formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-white font-medium mb-1">
                            {decision.output_action?.action || decision.decision_type}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-2">{decision.reasoning}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              {(decision.confidence_score * 100).toFixed(0)}% confidence
                            </span>
                            <span className="text-xs text-cyan-400">
                              {decision.output_action?.expected_impact}
                            </span>
                          </div>
                        </div>
                        <div>
                          {decision.executed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Clock className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Buy Products */}
          <Card className="p-4 bg-slate-900/50 border-slate-800">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Quick Checkout - Live Products
            </h4>
            <div className="space-y-3">
              {topProducts?.slice(0, 5).map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.title}</p>
                    <p className="text-xs text-slate-400">${product.price}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBuyNow(product)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white ml-2"
                  >
                    Buy Now
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Agent Performance */}
          <Card className="p-4 bg-slate-900/50 border-slate-800">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Agent Swarm Status
            </h4>
            <div className="space-y-3">
              {agentBrains?.slice(0, 5).map((agent) => (
                <div key={agent.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{agent.agent_name}</span>
                    <Badge 
                      variant="outline" 
                      className={agent.is_active ? "text-emerald-400 border-emerald-500/30" : "text-slate-500"}
                    >
                      {agent.is_active ? "ACTIVE" : "IDLE"}
                    </Badge>
                  </div>
                  <Progress value={agent.performance_score || 0} className="h-1" />
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 bg-gradient-to-br from-emerald-950/50 to-cyan-950/50 border-emerald-500/20">
            <h4 className="font-semibold text-white mb-3">⚡ Quick Commands</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Analyze Revenue", cmd: "Analyze current revenue and suggest growth tactics" },
                { label: "Deploy Agents", cmd: "Deploy all agents for maximum conversion" },
                { label: "Optimize Pricing", cmd: "Analyze and optimize product pricing for maximum profit" },
                { label: "Scale Campaign", cmd: "Scale winning marketing campaigns 2x" },
              ].map((action) => (
                <Button
                  key={action.label}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    think(action.cmd);
                    toast.success(`🧠 ${action.label}`);
                  }}
                  className="text-xs border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
