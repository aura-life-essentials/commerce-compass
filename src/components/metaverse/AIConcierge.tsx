import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send,
  Brain,
  Zap,
  Globe,
  TrendingUp,
  Users,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIVoice } from '@/hooks/useAIVoice';
import { useAIIntelligence } from '@/hooks/useAIIntelligence';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'insight' | 'action';
}

const GREETING_MESSAGES = [
  "Welcome to your Global Command Center. I'm your AI Concierge, ready to assist with strategic decisions.",
  "How can I help you dominate your markets today?",
  "Shall I brief you on the latest performance metrics or market intelligence?"
];

const QUICK_ACTIONS = [
  { label: "Market Analysis", icon: TrendingUp, query: "Analyze current e-commerce trends and opportunities for Q1 2026" },
  { label: "Competitor Intel", icon: Users, query: "What are the top emerging competitors in the dropshipping space?" },
  { label: "Global Expansion", icon: Globe, query: "Which international markets show the highest growth potential for consumer goods?" },
  { label: "AI Strategy", icon: Brain, query: "How can we leverage AI to improve conversion rates and customer retention?" },
];

export function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { speak, stop, isSpeaking, isLoading: voiceLoading } = useAIVoice();
  const { query: queryIntelligence, isLoading: intelligenceLoading } = useAIIntelligence();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        type: 'text'
      }]);
      if (voiceEnabled) {
        speak(greeting);
      }
    }
  }, [isOpen, messages.length, speak, voiceEnabled]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Get AI response
    const result = await queryIntelligence(messageText, 'research');
    
    if (result) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
        type: 'insight'
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        // Truncate for TTS to first 500 chars
        const speakText = result.content.slice(0, 500) + (result.content.length > 500 ? '...' : '');
        speak(speakText);
      }
    }
  }, [input, queryIntelligence, speak, voiceEnabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-16 h-16 bg-gradient-to-br from-purple-600 via-violet-600 to-cyan-500 hover:from-purple-700 hover:via-violet-700 hover:to-cyan-600 shadow-2xl shadow-purple-500/30"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="w-7 h-7" />
          </motion.div>
        </Button>
        
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/30"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className={cn(
          "fixed z-50 transition-all duration-300",
          isExpanded 
            ? "inset-4" 
            : "bottom-6 right-6 w-[420px] h-[600px]"
        )}
      >
        <Card className="w-full h-full bg-black/95 backdrop-blur-xl border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative p-4 bg-gradient-to-r from-purple-900/50 via-violet-900/50 to-cyan-900/50 border-b border-purple-500/20">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    boxShadow: isSpeaking 
                      ? ['0 0 0 0 rgba(139, 92, 246, 0)', '0 0 0 10px rgba(139, 92, 246, 0.3)', '0 0 0 0 rgba(139, 92, 246, 0)']
                      : '0 0 0 0 rgba(139, 92, 246, 0)'
                  }}
                  transition={{ duration: 1, repeat: isSpeaking ? Infinity : 0 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center"
                >
                  <Bot className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    AI Concierge
                    <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px]">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse" />
                      LIVE
                    </Badge>
                  </h3>
                  <p className="text-xs text-purple-300">Powered by Advanced Intelligence</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-purple-300 hover:text-white hover:bg-purple-500/20"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-purple-300 hover:text-white hover:bg-purple-500/20"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-purple-300 hover:text-white hover:bg-purple-500/20"
                  onClick={() => { setIsOpen(false); stop(); }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                        : 'bg-purple-900/30 border border-purple-500/20 text-purple-100'
                    )}
                  >
                    {message.type === 'insight' && (
                      <div className="flex items-center gap-1 mb-2 text-xs text-cyan-400">
                        <Sparkles className="w-3 h-3" />
                        AI Intelligence
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {(intelligenceLoading || voiceLoading) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-purple-400"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span className="text-sm">Processing intelligence...</span>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-purple-400 mb-2">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-white justify-start text-xs"
                    onClick={() => handleSend(action.query)}
                  >
                    <action.icon className="w-3 h-3 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-purple-500/20 bg-black/50">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant={isListening ? "default" : "outline"}
                className={cn(
                  "shrink-0 rounded-full",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                )}
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="bg-purple-900/20 border-purple-500/30 text-white placeholder:text-purple-400 focus-visible:ring-purple-500"
              />
              
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim() || intelligenceLoading}
                className="shrink-0 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
