import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Sparkles, FileText, TrendingUp, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroMockup from '@/components/HeroMockup';

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[320px] w-[320px] rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-2xl">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-xl shadow-cyan-500/20 text-white font-bold">
              EA
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-[0.18em] uppercase text-foreground">ExpenseAI</h1>
              <p className="text-xs text-muted-foreground">Modern AI finance</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <button className="text-sm font-medium text-muted-foreground transition hover:text-cyan-300">Features</button>
            <button className="text-sm font-medium text-muted-foreground transition hover:text-cyan-300">Security</button>
            <button className="text-sm font-medium text-muted-foreground transition hover:text-cyan-300">Pricing</button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 cta-animated text-primary-foreground" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <section className="grid gap-10 xl:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 shadow-glow"
            >
              <Sparkles className="h-5 w-5" />
              AI-powered expense management for ambitious professionals
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl font-bold tracking-tight text-foreground md:text-6xl"
            >
              A premium AI finance dashboard that feels alive.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl text-lg leading-8 text-muted-foreground"
            >
              Discover a polished, modern experience for tracking expenses, planning budgets, scanning statements, and unlocking intelligent savings suggestions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <Button
                size="lg"
                className="rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 cta-animated text-primary-foreground px-8 py-5 shadow-2xl shadow-cyan-500/25"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-3xl border border-border bg-card/90 px-8 py-5 text-foreground"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 px-8 py-5 text-cyan-300"
                onClick={() => navigate('/signup')}
              >
                Try Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              {[
                { label: 'Smart analytics', value: 'Realtime insights' },
                { label: 'Budget health', value: 'Track every category' },
                { label: 'PDF scanning', value: 'Automated classification' },
              ].map((item) => (
                <div key={item.label} className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-2xl shadow-black/10">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{item.label}</p>
                  <p className="mt-3 text-xl font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative rounded-[2.5rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_48px_120px_rgba(13,19,43,0.38)]"
            >
              <div className="absolute -left-10 top-10 h-20 w-20 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute right-6 top-16 h-16 w-16 rounded-full bg-violet-500/10 blur-3xl" />
              <HeroMockup />
            </motion.div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            { title: 'AI insights', desc: 'A dynamic feed of recommendations, alerts and savings ideas.', icon: Sparkles },
            { title: 'PDF scanning', desc: 'Import statements instantly and let AI categorize transactions.', icon: FileText },
            { title: 'Budget tracking', desc: 'Visualize remaining spend with compact trend indicators.', icon: TrendingUp },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-[2rem] border border-border bg-card/90 p-7 shadow-2xl shadow-black/10 hover:-translate-y-1 hover:border-cyan-400/30 transition-transform"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-500 text-white shadow-xl shadow-cyan-500/20 mb-5">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </section>

        <section className="mt-20 rounded-[2.5rem] border border-border bg-slate-950/90 p-10 shadow-2xl shadow-black/20">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">AI finance engine</p>
              <h2 className="mt-4 text-4xl font-bold text-white">A premium fintech interface that moves with you.</h2>
              <p className="mt-5 text-lg text-muted-foreground leading-8">Everything is polished, layered, and interactive — from floating dashboard cards to glowing micro-interactions and animated charts.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-card/80 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Savings momentum</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">₹4,900</p>
                <p className="mt-3 text-sm text-muted-foreground">Realized by cutting impulse purchases.</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-card/80 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Subscription control</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">12 services</p>
                <p className="mt-3 text-sm text-muted-foreground">Manage recurring bills from one place.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 rounded-[2.5rem] border border-border bg-card/90 p-12 shadow-[0_40px_100px_rgba(13,19,43,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Ready to elevate your finance stack?</p>
              <h2 className="mt-3 text-4xl font-bold text-foreground">Launch a modern finance experience that recruiters notice.</h2>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                className="rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 cta-animated px-8 py-5 text-lg font-semibold text-primary-foreground"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
              <Button
                variant="ghost"
                className="rounded-3xl border border-border bg-card/95 px-8 py-5 text-lg font-semibold text-foreground"
                onClick={() => navigate('/login')}
              >
                View Tour
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
