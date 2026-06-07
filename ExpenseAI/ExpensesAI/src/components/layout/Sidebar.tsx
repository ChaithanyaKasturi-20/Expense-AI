import { Home, Layers, Sparkles, Bell, FileText, Settings, PieChart, ArrowRight, TrendingUp, Target } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { categories, categoryIcons, categoryColors, type Category } from '@/lib/mockData';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: Home },
  { label: 'Budgets', href: '/dashboard', icon: TrendingUp },
  { label: 'Monthly summary', href: '/dashboard/monthly-summary', icon: PieChart },
  { label: 'Profile', href: '/profile', icon: Settings },
];

const featuredCategories: Category[] = ['groceries', 'rent', 'shopping', 'fuel', 'medical', 'bills'];

const categoryRoute = (category: Category) => `/dashboard/category/${category.replace(/\s+/g, '-')}`;

const tools = [
  { label: 'AI assistant', href: '#', icon: Sparkles },
  { label: 'Statements', href: '#', icon: FileText },
  { label: 'Spending', href: '#', icon: Layers },
];

export function Sidebar() {
  return (
    <>
      <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] shrink-0 overflow-hidden rounded-[2.25rem] border border-border bg-card/90 p-5 shadow-2xl shadow-black/10 xl:block overflow-y-auto backdrop-blur-xl">
        <div className="mb-8 rounded-[2rem] border border-border/70 bg-card p-5 shadow-lg shadow-black/5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-xl shadow-cyan-500/20">
              EA
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">ExpenseAI Studio</p>
              <p className="text-xs text-muted-foreground">Premium dashboards and AI finance tools.</p>
            </div>
          </div>

          {/* Left-side summary cards removed per design: balance & health not required */}
        </div>

        <nav className="space-y-2 mb-8">
          <p className="px-4 py-2 text-xs uppercase tracking-[0.24em] font-semibold text-muted-foreground mb-3">Dashboard</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-xl' : 'text-muted-foreground hover:bg-card/80 hover:text-foreground'
                  }`
                }
              >
                <span className="text-cyan-400">
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mb-8 space-y-3">
          <p className="px-4 py-2 text-xs uppercase tracking-[0.24em] font-semibold text-muted-foreground">Actions</p>
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <a
                key={tool.label}
                href={tool.href}
                className="group flex items-center gap-3 rounded-3xl border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:border-cyan-400/30 hover:bg-card/95 hover:text-foreground"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/80 text-cyan-300 shadow-inner shadow-cyan-500/10">
                  <Icon className="h-4 w-4" />
                </span>
                {tool.label}
              </a>
            );
          })}
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-card/80 p-5 shadow-lg shadow-black/5">
          <p className="text-sm font-semibold text-foreground mb-3">Top categories</p>
          <div className="space-y-3">
            {featuredCategories.map((category) => (
              <NavLink
                key={category}
                to={categoryRoute(category)}
                className="group flex items-center justify-between gap-3 rounded-3xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground transition hover:border-cyan-400/30 hover:bg-card/95 hover:text-foreground"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl" style={{ backgroundColor: `${categoryColors[category]}20`, color: categoryColors[category] }}>
                    {categoryIcons[category]}
                  </span>
                  <span className="capitalize">{category}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
              </NavLink>
            ))}
          </div>
        </div>
      </aside>

      <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] -translate-x-1/2 rounded-3xl border border-border bg-card p-3 shadow-2xl xl:hidden">
        <div className="grid grid-cols-4 gap-2">
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `inline-flex flex-col items-center justify-center gap-1 rounded-3xl px-2 py-2 text-[10px] font-semibold transition ${
                    isActive ? 'bg-gradient-to-br from-cyan-500 to-violet-500 text-white shadow-xl' : 'text-muted-foreground hover:bg-card/5 hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `inline-flex flex-col items-center justify-center gap-1 rounded-3xl px-2 py-2 text-[10px] font-semibold transition ${
                isActive ? 'bg-gradient-to-br from-cyan-500 to-violet-500 text-white shadow-xl' : 'text-muted-foreground hover:bg-card/5 hover:text-foreground'
              }`
            }
          >
            <Settings className="h-4 w-4" />
            <span>Account</span>
          </NavLink>
        </div>
      </div>
    </>
  );
}
