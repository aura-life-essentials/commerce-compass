import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PromoCodeInputProps {
  onValidate: (code: string) => Promise<{
    valid: boolean;
    discount?: string;
    error?: string;
  }>;
  onApply: (code: string) => void;
  onClear: () => void;
  appliedCode?: string | null;
  appliedDiscount?: string | null;
  className?: string;
}

export function PromoCodeInput({ 
  onValidate, 
  onApply, 
  onClear, 
  appliedCode, 
  appliedDiscount,
  className 
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  const handleValidate = async () => {
    if (!code.trim()) return;
    
    setIsValidating(true);
    setError(null);

    try {
      const result = await onValidate(code.trim().toUpperCase());
      
      if (result.valid) {
        onApply(code.trim().toUpperCase());
        setCode('');
        setShowInput(false);
      } else {
        setError(result.error || 'Invalid promo code');
      }
    } catch {
      setError('Failed to validate code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    onClear();
    setCode('');
    setError(null);
  };

  if (appliedCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            <Badge variant="secondary" className="mr-2">{appliedCode}</Badge>
            {appliedDiscount}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-6 w-6 p-0 hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!showInput ? (
          <motion.button
            key="toggle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Tag className="w-4 h-4" />
            Have a promo code?
          </motion.button>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleValidate();
                  if (e.key === 'Escape') {
                    setShowInput(false);
                    setCode('');
                    setError(null);
                  }
                }}
                className="uppercase"
                disabled={isValidating}
              />
              <Button
                onClick={handleValidate}
                disabled={!code.trim() || isValidating}
                size="sm"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowInput(false);
                  setCode('');
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
            
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
