import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, ShoppingBag, Vote, Gem, Zap, Globe, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetaverseOffice } from './MetaverseOffice';
import { useMetaverse } from '@/hooks/useMetaverse';

export function MetaverseHub() {
  const { spaces, isLoading } = useMetaverse();
  const [activeSpace, setActiveSpace] = useState<'office' | 'showroom' | 'meeting' | 'event'>('office');
  
  const spaceIcons = {
    office: Building2,
    showroom: ShoppingBag,
    meeting: MessageSquare,
    event: Zap
  };
  
  const spaceDescriptions = {
    office: 'Virtual headquarters with workstations and team collaboration',
    showroom: 'Browse and purchase products in immersive 3D',
    meeting: 'Private meeting rooms for DAO discussions',
    event: 'Live events, launches, and community gatherings'
  };
  
  const totalOnline = spaces.reduce((sum, s) => sum + (s.current_visitors || 0), 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-500" />
            Metaverse Business Hub
          </h2>
          <p className="text-muted-foreground">Your virtual headquarters in the metaverse</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-green-500 text-green-400 px-3 py-1">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            {totalOnline} Online
          </Badge>
        </div>
      </div>
      
      {/* Space Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['office', 'showroom', 'meeting', 'event'] as const).map((spaceType, index) => {
          const space = spaces.find(s => s.space_type === spaceType);
          const Icon = spaceIcons[spaceType];
          const isActive = activeSpace === spaceType;
          
          return (
            <motion.div
              key={spaceType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  isActive 
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50' 
                    : 'hover:border-purple-500/30'
                }`}
                onClick={() => setActiveSpace(spaceType)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isActive 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                        : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="w-3 h-3" />
                      <span>{space?.current_visitors || 0}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold capitalize mb-1">{spaceType}</h3>
                  <p className="text-xs text-muted-foreground">{spaceDescriptions[spaceType]}</p>
                  {space?.is_live && (
                    <Badge className="mt-2 bg-green-500/20 text-green-400 border-0">
                      Live
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Main 3D View */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 capitalize">
            {React.createElement(spaceIcons[activeSpace], { className: "w-5 h-5 text-purple-500" })}
            {activeSpace} Space
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activeSpace === 'office' ? (
            <MetaverseOffice />
          ) : (
            <div className="h-[600px] bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                  {React.createElement(spaceIcons[activeSpace], { className: "w-10 h-10 text-purple-400" })}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 capitalize">{activeSpace} Coming Soon</h3>
                <p className="text-purple-300 max-w-sm mx-auto">
                  This space is under construction. Check back soon for an immersive experience!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold">Real-time Presence</h4>
                <p className="text-xs text-muted-foreground">See other visitors live</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Move around, see avatars of other users, and collaborate in real-time with voice chat.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Gem className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold">NFT-Gated Access</h4>
                <p className="text-xs text-muted-foreground">Exclusive spaces for members</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Hold our NFT membership passes to access exclusive rooms and premium features.
            </p>
          </CardContent>
        </Card>
        
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
              Participate in governance decisions with immersive 3D voting experiences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
