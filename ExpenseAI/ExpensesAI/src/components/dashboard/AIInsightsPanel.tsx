import { motion } from 'framer-motion';
import { Activity, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import type { AnalysisResult } from '@/services/ai';

interface AIInsightsPanelProps {
  analysis: AnalysisResult | null;
  recurringCount: number;
  recurringTotal: number;
  healthScore: number;
}

export function AIInsightsPanel({ analysis, recurringCount, recurringTotal, healthScore }: AIInsightsPanelProps) {
  const suggestions = analysis?.suggestions ?? [];
  const metrics = analysis?.metrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-[2rem] border border-border bg-card/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-600">AI finance assistant</p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground font-display">Smart insights</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">A quick view of your health score, recurring charges, and savings opportunities so you can act with confidence.</p>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-card px-6 py-5 text-center shadow-inner shadow-cyan-500/10">
          <span className="text-xs uppercase tracking-[0.35em] text-cyan-600">Health score</span>
          <p className="mt-4 text-5xl font-semibold text-foreground">{healthScore}%</p>
          <p className="mt-2 text-sm text-muted-foreground">Spending balance today</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border bg-card p-5 text-foreground shadow-sm shadow-black/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-600">
            <Sparkles className="h-4 w-4" /> AI tips ready
          </div>
          <p className="mt-3 text-3xl font-semibold">{suggestions.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Live guidance available</p>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-card p-5 text-foreground shadow-sm shadow-black/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
            <ShieldCheck className="h-4 w-4" /> Recurring spend
          </div>
          <p className="mt-3 text-3xl font-semibold">{recurringCount}</p>
          <p className="mt-1 text-sm text-muted-foreground">₹{recurringTotal.toFixed(0)} / mo</p>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-card p-5 text-foreground shadow-sm shadow-black/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
            <Zap className="h-4 w-4" /> Savings potential
          </div>
          <p className="mt-3 text-3xl font-semibold">₹{metrics?.potentialSavings ?? 0}</p>
          <p className="mt-1 text-sm text-muted-foreground">Potential this month</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {suggestions.slice(0, 2).map((suggestion, index) => (
          <div key={index} className="rounded-[1.75rem] border border-border bg-card p-5 text-foreground shadow-sm shadow-black/10">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-600">Tip {index + 1}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{suggestion}</p>
          </div>
        ))}
        <div className="rounded-[1.75rem] border border-border bg-card p-5 text-foreground shadow-sm shadow-black/10">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-600">Quick advice</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Limit one major treat purchase per week and shift subscriptions into one clean monthly budget.</p>
        </div>
      </div>
    </motion.div>
  );
}
