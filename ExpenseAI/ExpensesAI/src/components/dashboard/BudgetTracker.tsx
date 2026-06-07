import { AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Category, categoryIcons, categoryColors } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface BudgetRow {
  category: Category;
  spent: number;
  limit: number;
  percent: number;
}

interface BudgetTrackerProps {
  budgets: BudgetRow[];
  monthlyBudget: number;
  onCategoryClick?: (category: Category) => void;
}

export function BudgetTracker({ budgets, monthlyBudget, onCategoryClick }: BudgetTrackerProps) {
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const overBudget = budgets.filter((b) => b.percent > 100).length;
  const onTrack = budgets.filter((b) => b.percent <= 100).length;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Budget overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Set your spending limits</h2>
          </div>
          <div className="flex gap-3">
            <div className="rounded-[1.5rem] bg-emerald-100 px-4 py-2 text-sm text-emerald-700 font-medium">
              <CheckCircle2 className="inline-block h-4 w-4 mr-2" />
              {onTrack} on track
            </div>
            {overBudget > 0 && (
              <div className="rounded-[1.5rem] bg-rose-100 px-4 py-2 text-sm text-rose-700 font-medium">
                <AlertCircle className="inline-block h-4 w-4 mr-2" />
                {overBudget} over
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Monthly budget</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">₹{monthlyBudget.toLocaleString()}</p>
            <p className="mt-2 text-sm text-muted-foreground">Goal for the month</p>
          </div>
          <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Total allocated</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">₹{totalLimit.toLocaleString()}</p>
          </div>
          <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Remaining</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">₹{Math.max(0, monthlyBudget - totalSpent).toLocaleString()}</p>
            <p className="mt-2 text-sm text-muted-foreground">Budget left</p>
          </div>
        </div>

        <div className="space-y-3">
          {budgets.map((budget) => {
            const isOverBudget = budget.percent > 100;
            const isNearBudget = budget.percent > 80 && budget.percent <= 100;
              return (
              <motion.button
                key={budget.category}
                onClick={() => onCategoryClick?.(budget.category)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full rounded-[1.75rem] border border-border bg-card/5 p-4 text-left transition hover:border-border hover:bg-card/10"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-3xl text-xl"
                    style={{ backgroundColor: `${categoryColors[budget.category]}20`, color: categoryColors[budget.category] }}
                  >
                    {categoryIcons[budget.category]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className="font-semibold text-foreground capitalize">{budget.category}</p>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}</p>
                        <p className={cn('text-xs font-medium', isOverBudget ? 'text-rose-600' : isNearBudget ? 'text-amber-600' : 'text-emerald-600')}>
                          {budget.percent}% spent
                        </p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/10">
                      <motion.div
                        className={cn(
                          'h-full rounded-full transition-all',
                          isOverBudget ? 'bg-rose-500' : isNearBudget ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, budget.percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
