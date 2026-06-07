import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, PieChart, CreditCard } from 'lucide-react';

const stats = [
  { label: 'Forecast accuracy', value: '97%', accent: 'from-cyan-500 to-blue-500', icon: Sparkles },
  { label: 'Saved last month', value: '₹1.2k', accent: 'from-violet-500 to-fuchsia-500', icon: ArrowUpRight },
];

export const HeroMockup: React.FC = () => {
  return (
    <div className="hidden lg:block relative w-full max-w-[520px]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_40px_120px_rgba(13,19,43,0.35)]"
      >
        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-10 top-24 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="mb-6 rounded-[2rem] bg-slate-900/80 p-5 border border-white/10 shadow-inner shadow-cyan-500/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/70">Finance AI preview</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Smart wallet control</h2>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-500 p-3 text-white shadow-xl shadow-cyan-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] bg-slate-950/70 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>Weekly spend</span>
              <span className="text-cyan-300">+4.8%</span>
            </div>
            <div className="mt-4 h-44 rounded-[1.75rem] bg-gradient-to-br from-slate-900 to-slate-800 p-4 shadow-inner">
              <svg viewBox="0 0 100 44" className="h-full w-full">
                <defs>
                  <linearGradient id="mockStroke" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path d="M2 34 C18 24 30 28 40 16 C52 4 62 22 72 18 C84 14 92 24 98 14" fill="none" stroke="url(#mockStroke)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((item) => (
              <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/20 transition hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-3xl bg-gradient-to-br ${item.accent} text-white shadow-xl`}>
                    <item.icon className="m-3 h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="absolute left-0 top-24 h-24 w-24 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute right-0 bottom-16 h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />
    </div>
  );
};

export default HeroMockup;
