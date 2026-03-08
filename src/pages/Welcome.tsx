import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ShoppingBag, Mail, Shield, Truck, RotateCcw } from 'lucide-react';
import welcomeHero from '@/assets/welcome-hero.jpg';

export default function Welcome() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Full-screen cinematic background */}
      <div className="absolute inset-0">
        <img
          src={welcomeHero}
          alt="TrendVault Premium Collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, delay: Math.random() * 3 }}
            className="absolute w-1 h-1 bg-primary rounded-full"
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Brand */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold text-center mb-4 tracking-tight"
            >
              <span className="text-foreground">Trend</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">
                Vault
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-muted-foreground text-center max-w-xl mb-12 leading-relaxed"
            >
              Curated viral products you didn't know you needed.
              <br />
              <span className="text-foreground font-medium">Discover what's trending before everyone else.</span>
            </motion.p>

            {/* Enter Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Button
                size="lg"
                onClick={() => setEntered(true)}
                className="group relative h-16 px-12 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary via-emerald-500 to-cyan-500 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 mr-3" />
                Enter Store
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Free Shipping $25+</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="redirect"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 min-h-screen flex items-center justify-center"
            onAnimationComplete={() => navigate('/store')}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <Sparkles className="w-16 h-16 text-primary" />
              </motion.div>
              <p className="text-xl text-muted-foreground">Loading your experience...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
