import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Globe, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Radio,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LiveMetric {
  id: string;
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

interface LiveEvent {
  id: string;
  type: 'sale' | 'visitor' | 'milestone' | 'alert';
  message: string;
  timestamp: Date;
  value?: string;
}

const MOCK_METRICS: LiveMetric[] = [
  { id: '1', label: 'Active Visitors', value: '2,847', change: 12.4, icon: Users, color: 'text-blue-400' },
  { id: '2', label: 'Today\'s Revenue', value: '$47,293', change: 8.7, icon: DollarSign, color: 'text-green-400' },
  { id: '3', label: 'Conversion Rate', value: '4.28%', change: -0.3, icon: TrendingUp, color: 'text-purple-400' },
  { id: '4', label: 'Pending Orders', value: '156', change: 23.1, icon: Clock, color: 'text-amber-400' },
];

const MOCK_EVENTS: LiveEvent[] = [
  { id: '1', type: 'sale', message: 'New order from Germany', timestamp: new Date(), value: '$189.00' },
  { id: '2', type: 'milestone', message: 'Hit 10,000 monthly visitors!', timestamp: new Date() },
  { id: '3', type: 'visitor', message: 'VIP customer browsing products', timestamp: new Date() },
];

export function LiveIntelligenceFeed() {
  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [events, setEvents] = useState<LiveEvent[]>(MOCK_EVENTS);
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Randomly update a metric
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        change: metric.change + (Math.random() - 0.5) * 2
      })));

      // Occasionally add a new event
      if (Math.random() > 0.7) {
        const eventTypes = ['sale', 'visitor', 'milestone'] as const;
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const messages = {
          sale: ['New order from USA', 'Premium package sold', 'Bulk order received', 'VIP purchase completed'],
          visitor: ['Investor viewing analytics', 'New lead captured', 'Returning customer online'],
          milestone: ['Revenue goal 80% complete', 'New market unlocked', '100 orders this hour']
        };
        
        const newEvent: LiveEvent = {
          id: Date.now().toString(),
          type: randomType,
          message: messages[randomType][Math.floor(Math.random() * messages[randomType].length)],
          timestamp: new Date(),
          value: randomType === 'sale' ? `$${(Math.random() * 500 + 50).toFixed(2)}` : undefined
        };
        
        setEvents(prev => [newEvent, ...prev].slice(0, 10));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getEventIcon = (type: LiveEvent['type']) => {
    switch (type) {
      case 'sale': return DollarSign;
      case 'visitor': return Users;
      case 'milestone': return Zap;
      case 'alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const getEventColor = (type: LiveEvent['type']) => {
    switch (type) {
      case 'sale': return 'text-green-400 bg-green-500/20';
      case 'visitor': return 'text-blue-400 bg-blue-500/20';
      case 'milestone': return 'text-amber-400 bg-amber-500/20';
      case 'alert': return 'text-red-400 bg-red-500/20';
      default: return 'text-purple-400 bg-purple-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-5 h-5 text-red-500" />
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500/30"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h3 className="font-bold text-lg">Live Intelligence Feed</h3>
          <Badge className={cn(
            "border-0",
            isLive ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"
          )}>
            {isLive ? 'LIVE' : 'PAUSED'}
          </Badge>
        </div>
        
        <button
          onClick={() => setIsLive(!isLive)}
          className="text-sm text-muted-foreground hover:text-white transition-colors"
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <motion.div
            key={metric.id}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden"
          >
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                  <motion.div
                    key={metric.change}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-center text-xs",
                      metric.change >= 0 ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {metric.change >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(metric.change).toFixed(1)}%
                  </motion.div>
                </div>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Events */}
      <Card className="bg-black/40 border-purple-500/20 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Real-Time Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            <AnimatePresence>
              {events.map((event, index) => {
                const Icon = getEventIcon(event.type);
                const colors = getEventColor(event.type);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg",
                      index === 0 ? "bg-purple-500/10" : ""
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", colors)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{event.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {event.value && (
                      <Badge className="bg-green-500/20 text-green-400 border-0">
                        {event.value}
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
