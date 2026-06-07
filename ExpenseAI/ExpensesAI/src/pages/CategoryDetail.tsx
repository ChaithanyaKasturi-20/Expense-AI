import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Filter, MoreVertical, Sparkles, TrendingDown, TrendingUp, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { AddExpenseModal, ExpenseFormPayload } from '@/components/dashboard/AddExpenseModal';
import { useAuth } from '@/context/AuthContext';
import { fetchExpenses, createExpense, deleteExpense, updateExpense } from '@/services/supabaseExpenses';
import { categories, categoryIcons, categoryColors, type Category, type Expense } from '@/lib/mockData';
import { toast } from '@/components/ui/sonner';

const categoryToSlug = (category: Category) => category.replace(/\s+/g, '-');
const slugToCategory = (slug: string | undefined) => categories.find((category) => categoryToSlug(category) === slug);

type SortOption = 'newest' | 'amount' | 'merchant';

const paymentIcon = (paymentMethod?: string) => {
  if (!paymentMethod) return <Wallet className="h-4 w-4" />;
  const lower = paymentMethod.toLowerCase();
  if (lower.includes('card')) return <CreditCard className="h-4 w-4" />;
  if (lower.includes('phone') || lower.includes('upi') || lower.includes('google') || lower.includes('pay')) return <Smartphone className="h-4 w-4" />;
  return <Wallet className="h-4 w-4" />;
};

const getTrendText = (current: number, previous: number) => {
  if (!previous) return 'New category activity this month.';
  const diff = current - previous;
  const change = Math.abs(Math.round((diff / Math.max(previous, 1)) * 100));
  return diff >= 0
    ? `This month is ${change}% higher than last month.`
    : `Good progress — ${change}% lower than last month.`;
};

export default function CategoryDetail() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const category = slugToCategory(categorySlug);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleAddExpense = async (payload: ExpenseFormPayload) => {
    if (!user) return;

    try {
      const created = await createExpense(user.uid, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: new Date(),
        description: payload.description,
        amount: payload.amount,
        category: payload.category,
        merchant: payload.merchant,
        paymentMethod: payload.paymentMethod,
        notes: payload.notes,
        tags: payload.tags,
        receiptUrl: payload.receiptUrl,
        source: 'MANUAL',
        isImpulse: false,
      });
      setExpenses((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      toast.success('Transaction added');
    } catch (error) {
      console.error('Create expense failed', error);
      toast.error('Unable to save transaction.');
    }
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchExpenses(user.uid)
      .then((data) => setExpenses(data))
      .catch((error) => {
        console.error('CategoryDetail fetch error', error);
        toast.error('Unable to load expenses.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const categoryExpenses = useMemo(
    () => (category ? expenses.filter((item) => item.category === category) : []),
    [expenses, category]
  );

  const currentMonth = useMemo(() => {
    const now = new Date();
    return categoryExpenses.filter((expense) => {
      const date = new Date(expense.date);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
  }, [categoryExpenses]);

  const previousMonth = useMemo(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return categoryExpenses.filter((expense) => {
      const date = new Date(expense.date);
      return date.getFullYear() === prev.getFullYear() && date.getMonth() === prev.getMonth();
    });
  }, [categoryExpenses]);

  const totalCurrent = useMemo(() => currentMonth.reduce((sum, expense) => sum + expense.amount, 0), [currentMonth]);
  const totalPrevious = useMemo(() => previousMonth.reduce((sum, expense) => sum + expense.amount, 0), [previousMonth]);
  const trendValue = totalPrevious ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100) : 0;

  const weeklyData = useMemo(() => {
    const lastSevenDays = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - index));
      return { label: format(day, 'EEE'), value: 0 as number };
    });
    currentMonth.forEach((expense) => {
      const dayLabel = format(new Date(expense.date), 'EEE');
      const point = lastSevenDays.find((entry) => entry.label === dayLabel);
      if (point) point.value += expense.amount;
    });
    return lastSevenDays;
  }, [currentMonth]);

  const sortedTransactions = useMemo(() => {
    const items = [...categoryExpenses];
    if (sortBy === 'amount') {
      return items.sort((a, b) => b.amount - a.amount);
    }
    if (sortBy === 'merchant') {
      return items.sort((a, b) => (a.merchant || a.description).localeCompare(b.merchant || b.description));
    }
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [categoryExpenses, sortBy]);

  const topMerchant = useMemo(() => {
    const bucket: Record<string, number> = {};
    categoryExpenses.forEach((expense) => {
      const key = expense.merchant || expense.description;
      bucket[key] = (bucket[key] ?? 0) + expense.amount;
    });
    return Object.entries(bucket)
      .sort((a, b) => b[1] - a[1])
      .map(([merchant]) => merchant)[0];
  }, [categoryExpenses]);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!user) return;
    const confirmed = window.confirm('Delete this transaction?');
    if (!confirmed) return;
    try {
      await deleteExpense(expenseId, user.uid);
      setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
      toast.success('Transaction removed');
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Unable to delete transaction.');
    }
  };

  const handleUpdateExpense = async (payload: ExpenseFormPayload) => {
    if (!user || !editingExpense) return;
    try {
      const updated = await updateExpense(editingExpense.id, user.uid, {
        description: payload.description,
        amount: payload.amount,
        category: payload.category,
        merchant: payload.merchant,
        paymentMethod: payload.paymentMethod,
        notes: payload.notes,
        tags: payload.tags,
        receiptUrl: payload.receiptUrl,
      });
      setExpenses((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingExpense(null);
      setIsEditModalOpen(false);
      toast.success('Transaction updated');
    } catch (error) {
      console.error('Update failed', error);
      toast.error('Unable to save changes.');
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header alertCount={0} />
        <main className="container mx-auto px-4 py-10">
          <div className="rounded-[2rem] border border-border bg-card p-10 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Category not found</p>
            <h1 className="mt-4 text-3xl font-semibold text-foreground">Oops.</h1>
            <p className="mt-2 text-muted-foreground">The category you are looking for does not exist. Please choose another category from the dashboard.</p>
            <Button className="mt-6" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header alertCount={0} />
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <Sidebar />

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/5 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-card/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                  </button>
                  <div className="inline-flex items-center gap-3 rounded-3xl bg-card/5 px-4 py-3">
                    <span
                      className="inline-flex h-12 w-12 items-center justify-center rounded-3xl text-2xl"
                      style={{ backgroundColor: `${categoryColors[category]}22`, color: categoryColors[category] }}
                    >
                      {categoryIcons[category]}
                    </span>
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Category</p>
                      <h1 className="mt-2 text-4xl font-semibold text-foreground">{category}</h1>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Add transaction</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-muted-foreground hover:bg-card/5">
                        <Filter className="h-4 w-4" />
                        Sort
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                      <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setSortBy('newest')}>Newest first</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSortBy('amount')}>Highest amount</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSortBy('merchant')}>Merchant</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Total this month</p>
                  <p className="mt-4 text-3xl font-semibold text-foreground">₹{totalCurrent.toFixed(0)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Across {currentMonth.length} payments</p>
                </div>
                <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Monthly change</p>
                  <div className="mt-4 flex items-center gap-2">
                    {trendValue >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                    <p className="text-2xl font-semibold text-foreground">{trendValue}%</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Compared to last month</p>
                </div>
                <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Top merchant</p>
                  <p className="mt-4 text-2xl font-semibold text-foreground">{topMerchant || 'No merchant yet'}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Most frequently spent here</p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Trend</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">Weekly spend</h2>
                  </div>
                  <div className="rounded-3xl bg-card/5 px-4 py-2 text-sm text-muted-foreground">Last 7 days</div>
                </div>
                <div className="mt-8 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="categoryTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={categoryColors[category]} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={categoryColors[category]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, color: '#0f172a' }} formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Spent']} />
                      <Area type="monotone" dataKey="value" stroke={categoryColors[category]} strokeWidth={3} fill="url(#categoryTrend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 text-foreground">
                  <div className="rounded-3xl bg-card/5 p-3 text-muted-foreground">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">AI insight</p>
                    <h2 className="mt-2 text-xl font-semibold text-foreground">Smart spending note</h2>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-7 text-muted-foreground">
                  {totalCurrent > totalPrevious
                    ? `Your ${category} spending is up ${trendValue}% this month. Try shifting one purchase to a cheaper merchant to keep this category under control.`
                    : `Nice work! ${category} spend is lower than last month. Keep this momentum by limiting non-essential purchases.`}
                </p>
                <div className="mt-6 space-y-3 rounded-[1.5rem] bg-card/5 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Quick tip</p>
                  <p>{category === 'groceries' ? 'Plan your weekly grocery list and avoid impulse buys at the checkout.' : 'Review recurring charges and shift any small payments into a category budget.'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Transactions</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">Recent {category} payments</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-card/5 px-3 py-2 text-sm text-muted-foreground">{categoryExpenses.length} transactions</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-card/5">
                        Sort by <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                      <DropdownMenuLabel>Sort transactions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setSortBy('newest')}>Newest first</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSortBy('amount')}>Highest amount</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setSortBy('merchant')}>Merchant</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse rounded-[1.75rem] border border-border bg-card/5 p-5" />
                    ))}
                  </div>
                ) : sortedTransactions.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-border bg-card/5 p-8 text-center text-muted-foreground">
                    No transactions found for this category yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedTransactions.map((expense) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[1.75rem] border border-border bg-card/5 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="grid h-14 w-14 place-items-center rounded-3xl text-xl"
                              style={{ backgroundColor: `${categoryColors[expense.category]}22`, color: categoryColors[expense.category] }}
                            >
                              {categoryIcons[expense.category]}
                            </div>
                            <div>
                              <p className="text-base font-semibold text-foreground">{expense.merchant || expense.description}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{format(new Date(expense.date), 'MMM d, yyyy • h:mm a')}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-start gap-2 text-right sm:items-end">
                            <p className="text-lg font-semibold text-foreground">₹{expense.amount.toFixed(2)}</p>
                            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm">
                              {paymentIcon(expense.paymentMethod)}
                              <span>{expense.paymentMethod || 'Card'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-muted-foreground">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[expense.category] }} />
                            {expense.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEdit(expense)}
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                          >
                            <MoreVertical className="h-4 w-4" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(expense.id)}
                            className="inline-flex items-center gap-2 text-rose-500 transition hover:text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <AddExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleUpdateExpense}
        initialExpense={editingExpense ? { description: editingExpense.description, amount: editingExpense.amount, category: editingExpense.category, merchant: editingExpense.merchant, paymentMethod: editingExpense.paymentMethod, notes: editingExpense.notes, tags: editingExpense.tags, receiptUrl: editingExpense.receiptUrl } : undefined}
        title="Edit transaction"
        submitLabel="Save Changes"
      />
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddExpense}
        initialExpense={category ? { description: '', amount: 0, category, merchant: '', paymentMethod: 'Card', notes: '', tags: [], receiptUrl: undefined } : undefined}
        title="Add transaction"
        submitLabel="Add transaction"
      />
    </div>
  );
}
