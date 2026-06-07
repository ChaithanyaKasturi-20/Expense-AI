import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyTrendChartProps {
  data: { day: string; amount: number }[];
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white font-display">Weekly trend</h3>
          <p className="text-sm text-gray-400">Spot the momentum in your spending.</p>
        </div>
        <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-gray-300">Last 7 days</div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
            <Tooltip
              formatter={(value: number) => [`₹${value}`, 'Spent']}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                padding: 12,
                color: 'white',
              }}
            />
            <Area type="monotone" dataKey="amount" stroke="#38bdf8" strokeWidth={3} fill="url(#trendGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
