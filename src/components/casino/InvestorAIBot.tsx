import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  X, 
  MessageSquare, 
  Sparkles,
  Volume2,
  VolumeX,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CASINO_KNOWLEDGE = {
  project: "Ultra Casino is a Web3 decentralized casino platform offering provably fair gaming with blockchain verification.",
  investment: "Investors receive NFT Casino Passes with equity ownership, lifetime access, VIP benefits, and revenue sharing.",
  funding: "We're raising $30,000 (approximately 8.57 ETH) for development. 30% of annual revenue goes to equity holders.",
  benefits: [
    "Lifetime free casino access",
    "Equity ownership based on contribution",
    "Revenue share from day one",
    "Exclusive VIP status",
    "Governance voting rights",
    "NFT tradeable on OpenSea, Coinbase NFT, Rarible"
  ],
  roadmap: [
    "Phase 1: Funding Round (Current)",
    "Phase 2: Smart Contract Development",
    "Phase 3: Beta Access for NFT Holders",
    "Phase 4: Public Launch with Revenue Sharing"
  ],
  games: "We'll launch with Blackjack, Roulette, Slots, Poker, and Dice - all provably fair using blockchain randomness.",
  security: "All games use smart contracts for provably fair outcomes. Every bet is verifiable on-chain.",
  returns: "Based on projected $500k annual revenue, a 1 ETH investment could return $17,500+ annually."
};

export function InvestorAIBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Welcome to Ultra Casino! I'm your AI investment advisor. I can answer questions about our Web3 casino project, investment opportunities, NFT benefits, and help guide you through the investment process. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('invest') || lowerMessage.includes('buy') || lowerMessage.includes('purchase')) {
      return `Great question about investing! 🚀\n\n${CASINO_KNOWLEDGE.investment}\n\n**How to Invest:**\n1. Connect your Web3 wallet (MetaMask, etc.)\n2. Choose your investment amount (minimum 0.01 ETH)\n3. Confirm the transaction\n4. Receive your NFT Casino Pass instantly!\n\nWould you like me to explain the equity structure or walk you through the investment process?`;
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('profit') || lowerMessage.includes('earn') || lowerMessage.includes('revenue')) {
      return `💰 **Investment Returns:**\n\n${CASINO_KNOWLEDGE.returns}\n\n**Revenue Distribution:**\n- 30% to equity holders (distributed proportionally)\n- 40% for operations & development\n- 20% for marketing & growth\n- 10% treasury reserve\n\nYour equity percentage is calculated based on your contribution relative to the total funding goal.`;
    }
    
    if (lowerMessage.includes('benefit') || lowerMessage.includes('perk') || lowerMessage.includes('what do i get')) {
      return `✨ **NFT Casino Pass Benefits:**\n\n${CASINO_KNOWLEDGE.benefits.map(b => `• ${b}`).join('\n')}\n\nThe more you invest, the higher your equity percentage and potential returns!`;
    }
    
    if (lowerMessage.includes('roadmap') || lowerMessage.includes('timeline') || lowerMessage.includes('when')) {
      return `📅 **Development Roadmap:**\n\n${CASINO_KNOWLEDGE.roadmap.map(r => `• ${r}`).join('\n')}\n\nWe're currently in Phase 1, actively raising funds. Beta access for NFT holders is expected within 3 months of funding completion!`;
    }
    
    if (lowerMessage.includes('game') || lowerMessage.includes('play') || lowerMessage.includes('casino')) {
      return `🎰 **Casino Games:**\n\n${CASINO_KNOWLEDGE.games}\n\n**Provably Fair Technology:**\n${CASINO_KNOWLEDGE.security}\n\nAs an NFT holder, you'll get lifetime free access to all games!`;
    }
    
    if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('trust') || lowerMessage.includes('scam')) {
      return `🔒 **Security & Trust:**\n\n${CASINO_KNOWLEDGE.security}\n\n**Additional Safeguards:**\n• Smart contracts audited by leading security firms\n• Team is fully doxxed with verifiable backgrounds\n• DAO governance ensures community control\n• All transactions on-chain and verifiable\n\nWould you like to see our audit reports or team information?`;
    }
    
    if (lowerMessage.includes('nft') || lowerMessage.includes('pass') || lowerMessage.includes('token')) {
      return `🎫 **NFT Casino Pass:**\n\nYour investment mints an NFT that represents:\n• Your equity ownership percentage\n• VIP tier level (Bronze/Silver/Gold/Diamond)\n• Lifetime casino access rights\n• Governance voting power\n\n**Tradeable On:**\n• OpenSea\n• Coinbase NFT\n• Rarible\n• LooksRare\n• Blur\n\nYou can sell your NFT anytime, transferring all benefits to the new owner!`;
    }
    
    if (lowerMessage.includes('minimum') || lowerMessage.includes('how much')) {
      return `💵 **Investment Amounts:**\n\n• **Minimum:** 0.01 ETH (~$35)\n• **Average:** 0.1 ETH (~$350)\n• **Popular:** 0.5 ETH (~$1,750)\n• **Whale Tier:** 1+ ETH (~$3,500+)\n\nRemember: The more you invest, the higher your equity percentage and potential revenue share!\n\nWant me to calculate potential returns for a specific amount?`;
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! 👋 Welcome to Ultra Casino!\n\n${CASINO_KNOWLEDGE.project}\n\nI'm here to help you:\n• Understand the investment opportunity\n• Explain NFT benefits\n• Guide you through investing\n• Answer any questions\n\nWhat would you like to know?`;
    }
    
    return `Thanks for your question! 🎰\n\n${CASINO_KNOWLEDGE.project}\n\n**Quick Facts:**\n• Funding Goal: $30,000\n• Revenue Share: 30% to equity holders\n• NFT Benefits: Lifetime access + VIP perks\n\nCould you tell me more specifically what you'd like to know? I can help with:\n• Investment process\n• ROI projections\n• NFT benefits\n• Security & trust\n• Games & features`;
  };

  const speakText = async (text: string) => {
    if (!audioEnabled) return;
    
    setIsSpeaking(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { text: text.replace(/[*#•]/g, '').slice(0, 500) }
      });
      
      if (data?.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('TTS error:', err);
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await generateResponse(input.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speakText(response);
    } catch (err) {
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "How do I invest?",
    "What are the benefits?",
    "Is it safe?",
    "What returns can I expect?"
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-primary to-accent shadow-lg"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <MessageSquare className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-2 -left-2"
          >
            <Badge className="bg-primary animate-pulse">
              <Bot className="w-3 h-3 mr-1" />
              AI Online
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="bg-background/95 backdrop-blur-xl border-primary/30 shadow-2xl">
              <CardHeader className="pb-2 bg-primary/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <span>Casino AI Advisor</span>
                      <p className="text-xs text-muted-foreground font-normal">Powered by ElevenLabs</p>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                    >
                      {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-80 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {isSpeaking && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center"
                      >
                        <Badge className="bg-primary/20 text-primary">
                          <Volume2 className="w-3 h-3 mr-1 animate-pulse" />
                          Speaking...
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Quick Questions */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((q) => (
                        <Button
                          key={q}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 border-primary/30"
                          onClick={() => {
                            setInput(q);
                            setTimeout(handleSend, 100);
                          }}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask about investing..."
                      className="flex-1 bg-muted/50 border-primary/20"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
