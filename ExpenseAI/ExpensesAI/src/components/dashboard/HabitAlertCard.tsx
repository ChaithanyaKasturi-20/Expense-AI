import { motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, CheckCircle, X, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitAlert } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface HabitAlertCardProps {
  alert: HabitAlert;
  onDismiss?: (id: string) => void;
  index?: number;
}

const severityStyles = {
  bad: {
    container: 'border-l-4 border-l-destructive bg-destructive/10 backdrop-blur-md border border-destructive/30',
    icon: 'text-destructive',
    badge: 'bg-destructive/30 border border-destructive/30 text-destructive-foreground',
  },
  warning: {
    container: 'border-l-4 border-l-warning bg-warning/10 backdrop-blur-md border border-warning/30',
    icon: 'text-warning',
    badge: 'bg-warning/30 border border-warning/30 text-warning-foreground',
  },
  good: {
    container: 'border-l-4 border-l-success bg-success/10 backdrop-blur-md border border-success/30',
    icon: 'text-success',
    badge: 'bg-success/30 border border-success/30 text-success-foreground',
  },
};

export function HabitAlertCard({ alert, onDismiss, index = 0 }: HabitAlertCardProps) {
  const styles = severityStyles[alert.severity];
  const SeverityIcon = alert.severity === 'good' ? CheckCircle : alert.severity === 'warning' ? AlertTriangle : AlertOctagon;
  const BadgeIcon = alert.severity === 'good' ? TrendingUp : alert.severity === 'warning' ? AlertTriangle : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'relative rounded-xl p-5 shadow-lg',
        styles.container
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('mt-0.5', styles.icon)}>
          <SeverityIcon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground">{alert.title}</h3>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-card/10"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">{alert.description}</p>
          
          <div className="flex items-center gap-4">
            <div className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border', styles.badge)}>
              <BadgeIcon className="h-3 w-3" />
              {alert.severity === 'good' ? 'Healthy trend' : `Save ₹${alert.savingPotential}/month`}
            </div>
          </div>
          
          <div className="flex items-start gap-2 rounded-lg bg-muted border border-border p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">{alert.suggestion}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
