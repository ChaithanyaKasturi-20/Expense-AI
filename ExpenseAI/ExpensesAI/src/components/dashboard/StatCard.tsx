import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'warning' | 'success';
}

const variantStyles = {
  default: 'border-border bg-card text-card-foreground',
  primary: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-100',
  warning: 'border-orange-400/25 bg-orange-500/10 text-orange-100',
  success: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100',
};

const iconStyles = {
  default: 'bg-muted text-primary border border-border',
  primary: 'bg-cyan-500/15 text-cyan-100 border border-cyan-400/20',
  warning: 'bg-orange-500/15 text-orange-100 border border-orange-400/20',
  success: 'bg-emerald-500/15 text-emerald-100 border border-emerald-400/20',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl shadow-black/20 transition-all duration-300 hover:border-border hover:bg-card/10',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold font-display leading-tight">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={cn('inline-flex items-center gap-1 text-sm font-medium', trend.isPositive ? 'text-success' : 'text-destructive')}> 
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-3xl p-3 shadow-inner shadow-white/5', iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-current opacity-5" />
    </motion.div>
  );
}
