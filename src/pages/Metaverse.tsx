import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Boxes, Globe, Zap, Shield, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetaverseHub } from '@/components/metaverse/MetaverseHub';

export default function Metaverse() {
  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-background to-cyan-900/20" />
        <motion.div
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Header */}
      <header className="relative border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30"
                  animate={{ 
                    boxShadow: [
                      '0 10px 40px -10px rgba(139, 92, 246, 0.3)',
                      '0 10px 40px -10px rgba(6, 182, 212, 0.3)',
                      '0 10px 40px -10px rgba(139, 92, 246, 0.3)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Boxes className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <span className="font-bold text-lg">Global Command Center</span>
                  <p className="text-xs text-muted-foreground">Metaverse HQ</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Brain className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Secure
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MetaverseHub />
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-border bg-background/80 backdrop-blur-xl mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 Aura Lift Essentials</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Powered by The Grok Father 9.0
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>ElevenLabs Voice</span>
              <span>•</span>
              <span>Perplexity Intel</span>
              <span>•</span>
              <span>Three.js 3D</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
