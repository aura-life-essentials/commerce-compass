import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gem, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Tag, 
  ShoppingCart,
  Heart,
  Share2,
  ExternalLink,
  Sparkles,
  Crown,
  Star,
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNFTMembership, NFTMembership } from '@/hooks/useNFTMembership';
import { useWeb3 } from '@/hooks/useWeb3';
import { toast } from 'sonner';

const TIER_COLORS = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-slate-400 to-slate-300',
  gold: 'from-yellow-500 to-amber-400',
  platinum: 'from-cyan-400 to-blue-300',
  diamond: 'from-purple-500 via-pink-500 to-purple-400'
};

const TIER_ICONS = {
  bronze: Star,
  silver: Sparkles,
  gold: Crown,
  platinum: Rocket,
  diamond: Gem
};

interface NFTListing {
  id: string;
  tier: string;
  price_eth: number;
  seller: string;
  token_id: string;
  listed_at: string;
  views: number;
  likes: number;
}

// Mock listings for demo
const mockListings: NFTListing[] = [
  { id: '1', tier: 'diamond', price_eth: 2.5, seller: '0x1234...5678', token_id: 'PROFIT-001', listed_at: '2h ago', views: 234, likes: 45 },
  { id: '2', tier: 'platinum', price_eth: 1.2, seller: '0xabcd...efgh', token_id: 'PROFIT-042', listed_at: '5h ago', views: 156, likes: 23 },
  { id: '3', tier: 'gold', price_eth: 0.5, seller: '0x9876...5432', token_id: 'PROFIT-089', listed_at: '1d ago', views: 89, likes: 12 },
  { id: '4', tier: 'silver', price_eth: 0.2, seller: '0xfedc...ba98', token_id: 'PROFIT-156', listed_at: '2d ago', views: 67, likes: 8 },
  { id: '5', tier: 'diamond', price_eth: 3.0, seller: '0x1111...2222', token_id: 'PROFIT-003', listed_at: '30m ago', views: 456, likes: 78 },
  { id: '6', tier: 'gold', price_eth: 0.45, seller: '0x3333...4444', token_id: 'PROFIT-123', listed_at: '3h ago', views: 123, likes: 19 },
];

// Recent sales for activity feed
const recentSales = [
  { tier: 'diamond', price: 2.8, buyer: '0xaaa...bbb', time: '2 mins ago' },
  { tier: 'platinum', price: 1.5, buyer: '0xccc...ddd', time: '15 mins ago' },
  { tier: 'gold', price: 0.52, buyer: '0xeee...fff', time: '1 hour ago' },
];

export function NFTMarketplace() {
  const { isConnected, walletAddress, connectWallet } = useWeb3();
  const { userNFTs, totalRoyalties } = useNFTMembership();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterTier, setFilterTier] = useState('all');
  const [likedNFTs, setLikedNFTs] = useState<Set<string>>(new Set());

  const filteredListings = mockListings
    .filter(nft => filterTier === 'all' || nft.tier === filterTier)
    .filter(nft => nft.token_id.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleBuy = async (listing: NFTListing) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }
    toast.success(`Purchasing ${listing.tier} NFT for ${listing.price_eth} ETH...`);
  };

  const toggleLike = (id: string) => {
    setLikedNFTs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-muted-foreground">Floor Price</span>
            </div>
            <div className="text-2xl font-bold">0.15 ETH</div>
            <div className="text-xs text-green-400">+12% this week</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">24h Volume</span>
            </div>
            <div className="text-2xl font-bold">45.6 ETH</div>
            <div className="text-xs text-green-400">+34% vs yesterday</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-400" />
              <span className="text-sm text-muted-foreground">Total Listed</span>
            </div>
            <div className="text-2xl font-bold">{mockListings.length}</div>
            <div className="text-xs text-muted-foreground">Active listings</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Gem className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Your Royalties</span>
            </div>
            <div className="text-2xl font-bold">{totalRoyalties.toFixed(4)} ETH</div>
            <div className="text-xs text-purple-400">7.5% on resales</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Token ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Listed</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Listings Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing, index) => {
              const Icon = TIER_ICONS[listing.tier as keyof typeof TIER_ICONS];
              const isLiked = likedNFTs.has(listing.id);
              
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group hover:border-purple-500/50 transition-all">
                    {/* NFT Visual */}
                    <div className={`h-40 bg-gradient-to-br ${TIER_COLORS[listing.tier as keyof typeof TIER_COLORS]} relative flex items-center justify-center`}>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Icon className="w-16 h-16 text-white/90" />
                      </motion.div>
                      
                      {/* Actions overlay */}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="w-8 h-8 rounded-full bg-black/50 backdrop-blur"
                          onClick={() => toggleLike(listing.id)}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="w-8 h-8 rounded-full bg-black/50 backdrop-blur"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Tier badge */}
                      <Badge className="absolute top-2 left-2 capitalize bg-black/50 backdrop-blur">
                        {listing.tier}
                      </Badge>
                    </div>
                    
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm">{listing.token_id}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {listing.listed_at}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xl font-bold">{listing.price_eth} ETH</div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {listing.likes + (isLiked ? 1 : 0)}
                          </span>
                          <span>{listing.views} views</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          onClick={() => handleBuy(listing)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now
                        </Button>
                        <Button variant="outline" size="icon">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Activity Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSales.map((sale, index) => {
                const Icon = TIER_ICONS[sale.tier as keyof typeof TIER_ICONS];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${TIER_COLORS[sale.tier as keyof typeof TIER_COLORS]} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm capitalize">{sale.tier}</div>
                      <div className="text-xs text-muted-foreground truncate">{sale.buyer}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{sale.price} ETH</div>
                      <div className="text-xs text-muted-foreground">{sale.time}</div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
          
          {/* Your NFTs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gem className="w-4 h-4 text-purple-400" />
                Your Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userNFTs.length > 0 ? (
                <div className="space-y-2">
                  {userNFTs.slice(0, 3).map(nft => {
                    const Icon = TIER_ICONS[nft.tier as keyof typeof TIER_ICONS];
                    return (
                      <div key={nft.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${TIER_COLORS[nft.tier as keyof typeof TIER_COLORS]} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium capitalize">{nft.tier}</div>
                          <div className="text-xs text-muted-foreground">#{nft.token_id.slice(-6)}</div>
                        </div>
                        <Button variant="ghost" size="sm">List</Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No NFTs yet. Mint one to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
