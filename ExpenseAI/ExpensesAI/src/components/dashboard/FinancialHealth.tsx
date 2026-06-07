import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertCircle, CheckCircle2, Zap, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FinancialHealthProps {
  healthScore: number;
  impulseSpending: number;
  totalSpent: number;
  savingsPct: number;
  recurringTotal: number;
  badHabitsCount: number;
}

export function FinancialHealth({ healthScore, impulseSpending, totalSpent, savingsPct, recurringTotal, badHabitsCount }: FinancialHealthProps) {
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'emerald', icon: CheckCircle2 };
    if (score >= 60) return { label: 'Good', color: 'blue', icon: TrendingUp };
    if (score >= 40) return { label: 'Fair', color: 'amber', icon: AlertCircle };
    return { label: 'Needs improvement', color: 'rose', icon: AlertCircle };
  };

  const status = getHealthStatus(healthScore);
  const StatusIcon = status.icon;

  const recommendations = [
    {
      icon: Zap,
      title: 'Reduce impulse spending',
      description: `You're spending ₹${impulseSpending.toFixed(0)} on impulse purchases. Set stricter limits.`,
      actionColor: 'rose',
    },
    {
      icon: Target,
      title: 'Optimize recurring charges',
      description: `You're paying ₹${recurringTotal.toFixed(0)}/month in subscriptions. Review and cancel unused ones.`,
      actionColor: 'amber',
    },
    {
      icon: PieChart,
      title: 'Create category budgets',
      description: 'Set spending limits per category to maintain better control over your finances.',
      actionColor: 'blue',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Financial wellness</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Your money health</h2>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <div className="relative h-24 w-24">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={`rgb(${status.color === 'emerald' ? '16, 185, 129' : status.color === 'blue' ? '59, 130, 246' : status.color === 'amber' ? '245, 158, 11' : '239, 68, 68'})`}
                  strokeWidth="8"
                  strokeDasharray={`${(healthScore / 100) * 282.7} 282.7`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{healthScore}</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Score</p>
                </div>
              </div>
            </div>
            <div>
              <div className={`rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2 bg-${status.color}-100 text-${status.color}-700`}>
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Your spending patterns and savings are {status.label.toLowerCase()}.</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border bg-card/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Savings rate</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{savingsPct.toFixed(1)}%</p>
            <p className="mt-2 text-xs text-muted-foreground">Of total spending</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-card/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Impulse ratio</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{totalSpent > 0 ? ((impulseSpending / totalSpent) * 100).toFixed(1) : '0'}%</p>
            <p className="mt-2 text-xs text-muted-foreground">Unplanned purchases</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-card/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Bad habits</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{badHabitsCount}</p>
            <p className="mt-2 text-xs text-muted-foreground">Detected patterns</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground mb-4">Smart recommendations</p>
        <div className="space-y-3">
          {recommendations.map((rec, idx) => {
            const Icon = rec.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-[1.5rem] border border-border bg-card/5 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-2xl p-2.5 text-${rec.actionColor}-600 bg-${rec.actionColor}-100 flex-shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{rec.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}