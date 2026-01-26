import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrialBadgeProps {
  daysRemaining: number;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

export function TrialBadge({ 
  daysRemaining, 
  className, 
  showIcon = true,
  variant = 'default' 
}: TrialBadgeProps) {
  const isUrgent = daysRemaining <= 2;
  const isLastDay = daysRemaining <= 1;

  if (variant === 'compact') {
    return (
      <Badge
        className={cn(
          "gap-1",
          isUrgent 
            ? "bg-warning/20 text-warning border-warning/30" 
            : "bg-primary/20 text-primary border-primary/30",
          className
        )}
      >
        {showIcon && <Clock className="w-3 h-3" />}
        {daysRemaining}d left
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        isUrgent
          ? "bg-warning/20 text-warning border border-warning/30"
          : "bg-primary/20 text-primary border border-primary/30",
        className
      )}
    >
      {showIcon && (
        <motion.div
          animate={isLastDay ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          {isUrgent ? (
            <Clock className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </motion.div>
      )}
      <span>
        {isLastDay ? (
          'Trial ends today!'
        ) : (
          <>
            <strong>{daysRemaining}</strong> day{daysRemaining !== 1 ? 's' : ''} left in trial
          </>
        )}
      </span>
    </motion.div>
  );
}
