import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface MonthlyComparisonChartProps {
  data: Array<{ month: string; actual: number; budget: number }>;
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-border bg-card/5 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Monthly Comparison</h3>
          <p className="text-sm text-muted-foreground">Actual spending vs budget projection</p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'white' }}
              formatter={(value) => [`₹${value}`, 'Amount']}
            />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
            <Bar dataKey="actual" name="Actual" fill="#06b6d4" radius={[12, 12, 0, 0]} />
            <Bar dataKey="budget" name="Budget" fill="#7c3aed" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
