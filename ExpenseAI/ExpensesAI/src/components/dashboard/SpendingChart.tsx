import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SpendingByCategory } from '@/lib/mockData';

interface SpendingChartProps {
  data: SpendingByCategory[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-[2rem] border border-border bg-card/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground font-display">Spending by category</h3>
          <p className="text-sm text-muted-foreground">A clean breakdown of your most active categories.</p>
        </div>
        <div className="rounded-3xl bg-card/5 px-4 py-2 text-sm font-medium text-muted-foreground">Total ₹{total.toFixed(0)}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="relative h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={4} dataKey="amount">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Amount']}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16,
                  padding: 12,
                  color: 'white',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold text-foreground">{data.length} categories</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
        </div>

        <div className="space-y-3">
          {data.slice(0, 5).map((item) => (
            <div key={item.category} className="flex items-center justify-between rounded-3xl border border-border bg-card/5 px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="capitalize">{item.category}</span>
              </div>
              <span className="font-semibold text-foreground">₹{item.amount.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
