import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Wallet, CreditCard, Check, Copy, ExternalLink, QrCode, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeb3 } from '@/hooks/useWeb3';
import { useNFTMembership } from '@/hooks/useNFTMembership';
import { toast } from 'sonner';

const ACCEPTED_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠', rate: 1, color: 'from-blue-500 to-purple-500' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', rate: 3200, color: 'from-blue-400 to-cyan-400' },
  { symbol: 'USDT', name: 'Tether', icon: '💲', rate: 3200, color: 'from-green-500 to-emerald-500' },
  { symbol: 'DAI', name: 'Dai', icon: '◈', rate: 3200, color: 'from-amber-500 to-yellow-500' }
];

const PAYMENT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab1C';

export function CryptoPayments() {
  const { walletAddress, connectWallet, isConnected, chainName } = useWeb3();
  const { userBenefits } = useNFTMembership();
  const [selectedToken, setSelectedToken] = useState(ACCEPTED_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const discount = userBenefits?.discount_percent || 0;
  const amountAfterDiscount = amount ? parseFloat(amount) * (1 - discount / 100) : 0;
  const tokenAmount = amountAfterDiscount / selectedToken.rate;

  const copyAddress = () => {
    navigator.clipboard.writeText(PAYMENT_ADDRESS);
    setCopied(true);
    toast.success('Address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">Today's Volume</span>
            </div>
            <div className="text-2xl font-bold">2.45 ETH</div>
            <div className="text-xs text-green-400">+18% from yesterday</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              <span className="text-sm text-muted-foreground">Transactions</span>
            </div>
            <div className="text-2xl font-bold">127</div>
            <div className="text-xs text-muted-foreground">This week</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-muted-foreground">Unique Wallets</span>
            </div>
            <div className="text-2xl font-bold">89</div>
            <div className="text-xs text-muted-foreground">Crypto customers</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-muted-foreground">Avg. Save</span>
            </div>
            <div className="text-2xl font-bold">15%</div>
            <div className="text-xs text-muted-foreground">NFT member discount</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Make Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Pay with Crypto
            </CardTitle>
            <CardDescription>
              Select your token and enter amount in USD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Token Selection */}
            <div className="grid grid-cols-4 gap-2">
              {ACCEPTED_TOKENS.map(token => (
                <motion.button
                  key={token.symbol}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedToken(token)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedToken.symbol === token.symbol
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-muted hover:border-muted-foreground'
                  }`}
                >
                  <div className="text-2xl mb-1">{token.icon}</div>
                  <div className="text-xs font-bold">{token.symbol}</div>
                </motion.button>
              ))}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (USD)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Discount Display */}
            {discount > 0 && amount && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400">NFT Member Discount</span>
                  <Badge className="bg-green-500">{discount}% OFF</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground line-through">${parseFloat(amount).toFixed(2)}</span>
                  <span className="text-lg font-bold text-green-400">${amountAfterDiscount.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Token Amount */}
            {amount && (
              <div className={`bg-gradient-to-r ${selectedToken.color} p-4 rounded-lg text-white`}>
                <div className="text-sm opacity-80">You Pay</div>
                <div className="text-2xl font-bold">
                  {tokenAmount.toFixed(6)} {selectedToken.symbol}
                </div>
                <div className="text-xs opacity-80 mt-1">
                  ≈ ${amountAfterDiscount.toFixed(2)} USD
                </div>
              </div>
            )}

            {/* Pay Button */}
            {!isConnected ? (
              <Button onClick={connectWallet} className="w-full" size="lg">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet to Pay
              </Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
                disabled={!amount}
              >
                <Zap className="w-4 h-4 mr-2" />
                Pay {tokenAmount.toFixed(4)} {selectedToken.symbol}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Receive Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-400" />
              Receive Payment
            </CardTitle>
            <CardDescription>
              Share this address to receive crypto payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Placeholder */}
            <div className="aspect-square max-w-[200px] mx-auto bg-white rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-32 h-32 text-gray-800 mx-auto" />
                <div className="text-xs text-gray-500 mt-2">Scan to pay</div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Payment Address</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm truncate">{PAYMENT_ADDRESS}</code>
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Supported Tokens */}
            <div>
              <div className="text-sm font-medium mb-2">Accepted Tokens</div>
              <div className="flex flex-wrap gap-2">
                {ACCEPTED_TOKENS.map(token => (
                  <Badge key={token.symbol} variant="outline" className="px-3 py-1">
                    {token.icon} {token.symbol}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Network Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Base Network</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Low fees, fast transactions. Switch to Base for best experience.
              </p>
            </div>

            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on BaseScan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Crypto Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { hash: '0x1234...5678', amount: 0.15, token: 'ETH', from: '0xabcd...ef01', time: '5 min ago', status: 'confirmed' },
              { hash: '0x2345...6789', amount: 100, token: 'USDC', from: '0xbcde...f012', time: '12 min ago', status: 'confirmed' },
              { hash: '0x3456...7890', amount: 0.08, token: 'ETH', from: '0xcdef...0123', time: '1 hour ago', status: 'confirmed' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {tx.token.charAt(0)}
                  </div>
                  <div>
                    <div className="font-mono text-sm">{tx.hash}</div>
                    <div className="text-xs text-muted-foreground">From {tx.from}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">+{tx.amount} {tx.token}</div>
                  <div className="text-xs text-muted-foreground">{tx.time}</div>
                </div>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Check className="w-3 h-3 mr-1" />
                  {tx.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
