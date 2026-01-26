import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, ShoppingBag, Vote, Gem, Zap, Globe, MessageSquare, Video, Brain, Radio, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetaverseOffice } from './MetaverseOffice';
import { LiveAvatarCall } from './LiveAvatarCall';
import { LiveIntelligenceFeed } from './LiveIntelligenceFeed';
import { GlobalAgencyDashboard } from './GlobalAgencyDashboard';
import { AIConcierge } from './AIConcierge';
import { useMetaverse } from '@/hooks/useMetaverse';
import { Link } from 'react-router-dom';

export function MetaverseHub() {
  const { spaces, isLoading } = useMetaverse();
  const [activeTab, setActiveTab] = useState<'office' | 'agencies' | 'intelligence' | 'connect'>('office');
  
  const totalOnline = spaces.reduce((sum, s) => sum + (s.current_visitors || 0), 0);
  
  return (
    <div className="space-y-6">
      {/* AI Concierge - Always Available */}
      <AIConcierge />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-500" />
            Global Command Center
          </h2>
          <p className="text-muted-foreground">Run your worldwide agency empire from the metaverse</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/metaverse">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Globe className="w-4 h-4 mr-2" />
              Enter Full Metaverse
            </Button>
          </Link>
          <Badge variant="outline" className="border-green-500 text-green-400 px-3 py-1">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            {totalOnline} Online
          </Badge>
        </div>
      </div>
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-purple-500/20">
          <TabsTrigger 
            value="office" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Virtual Office
          </TabsTrigger>
          <TabsTrigger 
            value="agencies"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Global Agencies
          </TabsTrigger>
          <TabsTrigger 
            value="intelligence"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            <Radio className="w-4 h-4 mr-2" />
            Live Intel
          </TabsTrigger>
          <TabsTrigger 
            value="connect"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            <Video className="w-4 h-4 mr-2" />
            Avatar Connect
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="office" className="mt-4">
          <Card className="overflow-hidden border-purple-500/20">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-900/30 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-500" />
                ProfitReaper Metaverse HQ
                <Badge className="ml-2 bg-green-500/20 text-green-400 border-0">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MetaverseOffice />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agencies" className="mt-4">
          <GlobalAgencyDashboard />
        </TabsContent>
        
        <TabsContent value="intelligence" className="mt-4">
          <LiveIntelligenceFeed />
        </TabsContent>
        
        <TabsContent value="connect" className="mt-4">
          <LiveAvatarCall />
        </TabsContent>
      </Tabs>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Real-time Presence</h4>
                  <p className="text-xs text-muted-foreground">See visitors live</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Move around, see avatars, and collaborate with voice chat powered by ElevenLabs.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">AI Concierge</h4>
                  <p className="text-xs text-muted-foreground">Voice-enabled assistant</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the bot icon for AI-powered insights with natural voice responses.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Vote className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Live DAO Voting</h4>
                  <p className="text-xs text-muted-foreground">Vote in virtual halls</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Participate in governance with immersive 3D voting experiences.
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Gem className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">NFT-Gated Access</h4>
                  <p className="text-xs text-muted-foreground">Exclusive spaces</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Hold NFT passes for exclusive rooms and premium features.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
