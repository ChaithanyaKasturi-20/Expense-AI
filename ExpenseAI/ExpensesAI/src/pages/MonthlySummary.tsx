import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Sparkles, TrendingDown, TrendingUp, PieChart, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { fetchExpenses } from '@/services/supabaseExpenses';
import { categories, categoryColors, categoryIcons, type Category, type Expense } from '@/lib/mockData';
import { toast } from '@/components/ui/sonner';

const monthName = (value: number) => new Date(2025, value, 1).toLocaleString('default', { month: 'long' });

export default function MonthlySummary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchExpenses(user.uid)
      .then((data) => setExpenses(data))
      .catch((error) => {
        console.error('MonthlySummary fetch error', error);
        toast.error('Unable to load spending data.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const now = new Date();
  const currentMonthExpenses = useMemo(
    () => expenses.filter((expense) => {
      const date = new Date(expense.date);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }),
    [expenses, now]
  );

  const previousMonth = useMemo(
    () => {
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return expenses.filter((expense) => {
        const date = new Date(expense.date);
        return date.getFullYear() === prevDate.getFullYear() && date.getMonth() === prevDate.getMonth();
      });
    },
    [expenses, now]
  );

  const totalCurrent = useMemo(
    () => currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [currentMonthExpenses]
  );
  const totalPrevious = useMemo(
    () => previousMonth.reduce((sum, expense) => sum + expense.amount, 0),
    [previousMonth]
  );
  const monthChange = totalPrevious ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100) : 0;

  const categoryTotals = useMemo(() => {
    const totals = new Map<Category, number>();
    currentMonthExpenses.forEach((expense) => {
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    });
    return Array.from(totals.entries())
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount, percentage: totalCurrent ? Math.round((amount / totalCurrent) * 100) : 0, color: categoryColors[category] }));
  }, [currentMonthExpenses, totalCurrent]);

  const recentTransactions = useMemo(
    () => [...currentMonthExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
    [currentMonthExpenses]
  );

  const bestCategory = categoryTotals[0];
  const insights = useMemo(() => {
    const base = [] as string[];
    if (monthChange > 12) base.push(`Your spending is up ${monthChange}% compared to last month.`);
    if (bestCategory) base.push(`Most spend is in ${bestCategory.category} with ₹${bestCategory.amount.toFixed(0)}.`);
    if (currentMonthExpenses.length < 1) base.push('Add more transactions to see deeper category insights.');
    return base.slice(0, 3);
  }, [monthChange, bestCategory, currentMonthExpenses.length]);

  const topCategoryItems = categoryTotals.slice(0, 4);

  const expandableCategories = categoryTotals.slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header alertCount={0} />
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <Sidebar />
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/5 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-card/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                  </button>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Monthly summary</p>
                    <h1 className="mt-2 text-3xl font-semibold text-foreground">{monthName(now.getMonth())} spending</h1>
                  </div>
                </div>
                <div className="hidden gap-4 lg:flex">
                  <div className="rounded-[1.5rem] bg-card/5 px-4 py-3 text-sm text-muted-foreground">
                    {currentMonthExpenses.length} transactions
                  </div>
                  <div className="rounded-[1.5rem] bg-card/5 px-4 py-3 text-sm text-muted-foreground">
                    Compared to {monthName((now.getMonth() + 11) % 12)}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Total spends</p>
                  <p className="mt-4 text-4xl font-semibold text-foreground">₹{totalCurrent.toFixed(0)}</p>
                  <p className="mt-3 text-sm text-muted-foreground">Total amount spent this month</p>
                </div>
                <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Month over month</p>
                  <div className="mt-4 flex items-center gap-2">
                    {monthChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-500" />
                    )}
                    <p className="text-3xl font-semibold text-foreground">{monthChange}%</p>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">Compared to last month</p>
                </div>
                <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Top category</p>
                  <p className="mt-4 text-3xl font-semibold text-foreground">{bestCategory?.category ?? '—'}</p>
                  <p className="mt-3 text-sm text-muted-foreground">₹{bestCategory?.amount.toFixed(0) ?? '0'}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[0.75fr_0.45fr]">
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Category breakdown</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">Where your money went</h2>
                  </div>
                  <div className="rounded-3xl bg-card/5 px-4 py-2 text-sm text-muted-foreground">Top categories</div>
                </div>

                <div className="mt-8 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryTotals} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, color: '#0f172a' }} formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Spent']} />
                      <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                        {categoryTotals.map((entry) => (
                          <Cell key={entry.category} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 space-y-3">
                  {topCategoryItems.map((category) => (
                    <div key={category.category} className="flex items-center justify-between rounded-[1.5rem] border border-border bg-card/5 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex h-10 w-10 items-center justify-center rounded-3xl text-xl"
                          style={{ backgroundColor: `${category.color}22`, color: category.color }}
                        >
                          {categoryIcons[category.category]}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">{category.category}</p>
                          <p className="text-sm text-muted-foreground">{category.percentage}% of spend</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground">₹{category.amount.toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">AI insights</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">Smart money notes</h2>
                <div className="mt-6 space-y-4">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="rounded-[1.5rem] border border-border bg-card/5 p-4">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-cyan-500" />
                        <p className="text-sm font-semibold">Insight</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Recent activity</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Latest transactions</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-card/5 px-4 py-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" /> Last 30 days
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  [...Array(4)].map((_, index) => (
                    <div key={index} className="h-24 rounded-[1.75rem] border border-border bg-card/5 p-4 animate-pulse" />
                  ))
                ) : recentTransactions.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-border bg-card/5 p-8 text-center text-muted-foreground">No transactions recorded yet.</div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((expense) => (
                      <div key={expense.id} className="rounded-[1.75rem] border border-border bg-card/5 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="grid h-12 w-12 place-items-center rounded-3xl text-xl" style={{ backgroundColor: `${categoryColors[expense.category]}22`, color: categoryColors[expense.category] }}>
                              {categoryIcons[expense.category]}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{expense.merchant || expense.description}</p>
                              <p className="text-sm text-muted-foreground">{format(new Date(expense.date), 'MMM d')}</p>
                            </div>
                          </div>
                          <p className="text-lg font-semibold text-foreground">₹{expense.amount.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              {expandableCategories.map((category) => {
                const categoryTransactions = currentMonthExpenses.filter((expense) => expense.category === category.category);
                return (
                  <details key={category.category} className="rounded-[2rem] border border-border bg-card p-5 shadow-sm">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-3xl text-xl" style={{ backgroundColor: `${category.color}22`, color: category.color }}>
                          {categoryIcons[category.category]}
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{category.category}</p>
                          <p className="text-sm text-muted-foreground">₹{category.amount.toFixed(0)} • {categoryTransactions.length} transactions</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </summary>
                    <div className="mt-5 space-y-3">
                      {categoryTransactions.slice(0, 3).map((expense) => (
                        <div key={expense.id} className="rounded-[1.5rem] border border-border bg-card/5 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-foreground">{expense.merchant || expense.description}</p>
                              <p className="text-sm text-muted-foreground">{format(new Date(expense.date), 'MMM d')} • {expense.paymentMethod || 'Card'}</p>
                            </div>
                            <p className="font-semibold text-foreground">₹{expense.amount.toFixed(0)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
