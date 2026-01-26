import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Cpu,
  Zap,
  Radio,
  Shield,
  Rocket
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AgencyCard {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'growing' | 'launching';
  revenue: string;
  agents: number;
  growth: number;
  icon: React.ElementType;
  color: string;
}

const AGENCIES: AgencyCard[] = [
  {
    id: '1',
    name: 'North America HQ',
    region: 'USA & Canada',
    status: 'active',
    revenue: '$2.4M',
    agents: 12,
    growth: 34,
    icon: Building2,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '2',
    name: 'EU Operations',
    region: 'Europe',
    status: 'active',
    revenue: '$1.8M',
    agents: 8,
    growth: 28,
    icon: Globe,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: '3',
    name: 'APAC Division',
    region: 'Asia Pacific',
    status: 'growing',
    revenue: '$980K',
    agents: 6,
    growth: 67,
    icon: Rocket,
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: '4',
    name: 'LATAM Expansion',
    region: 'Latin America',
    status: 'launching',
    revenue: '$340K',
    agents: 3,
    growth: 124,
    icon: Zap,
    color: 'from-green-500 to-emerald-500'
  }
];

const GLOBAL_STATS = [
  { label: 'Total Revenue', value: '$5.5M', icon: DollarSign },
  { label: 'Active Agents', value: '29', icon: Cpu },
  { label: 'Global Markets', value: '47', icon: Globe },
  { label: 'Live Operations', value: '24/7', icon: Radio },
];

export function GlobalAgencyDashboard() {
  const getStatusBadge = (status: AgencyCard['status']) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      growing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      launching: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return styles[status];
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {GLOBAL_STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/30 to-black/50 border-purple-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Agency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENCIES.map((agency, index) => (
          <motion.div
            key={agency.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="relative overflow-hidden bg-black/40 border-purple-500/20 backdrop-blur">
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${agency.color}`} />
              
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agency.color} flex items-center justify-center`}>
                      <agency.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{agency.name}</h4>
                      <p className="text-xs text-muted-foreground">{agency.region}</p>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(agency.status)}>
                    {agency.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-lg font-bold text-white">{agency.revenue}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{agency.agents}</p>
                    <p className="text-xs text-muted-foreground">AI Agents</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-400">+{agency.growth}%</p>
                    <p className="text-xs text-muted-foreground">Growth</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Q1 Target Progress</span>
                    <span className="text-white">{Math.min(agency.growth + 40, 100)}%</span>
                  </div>
                  <Progress value={Math.min(agency.growth + 40, 100)} className="h-2 bg-purple-900/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* World Map Placeholder */}
      <Card className="bg-gradient-to-br from-purple-900/20 via-black/40 to-cyan-900/20 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <h4 className="font-bold">Global Operations Map</h4>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-0">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
          </div>
          
          {/* Stylized world visualization */}
          <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Animated dots representing active locations */}
            {[
              { top: '30%', left: '20%', color: 'bg-blue-500' }, // NA
              { top: '35%', left: '45%', color: 'bg-purple-500' }, // EU
              { top: '40%', left: '75%', color: 'bg-amber-500' }, // APAC
              { top: '60%', left: '30%', color: 'bg-green-500' }, // LATAM
            ].map((loc, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ top: loc.top, left: loc.left }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full ${loc.color}`} />
                  <motion.div
                    className={`absolute inset-0 rounded-full ${loc.color} opacity-50`}
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
            
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }} 
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-purple-400 text-sm">Interactive 3D Globe Coming Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
