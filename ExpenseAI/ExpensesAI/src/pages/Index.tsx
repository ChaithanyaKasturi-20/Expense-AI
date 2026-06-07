import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingDown, AlertTriangle, Target, BadgeCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { HabitAlertCard } from '@/components/dashboard/HabitAlertCard';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { BudgetTracker } from '@/components/dashboard/BudgetTracker';
import { FinancialHealth } from '@/components/dashboard/FinancialHealth';
import { ReportGenerator } from '@/components/dashboard/ReportGenerator';
import { AddExpenseModal, ExpenseFormPayload } from '@/components/dashboard/AddExpenseModal';
import { AddSavingModal } from '@/components/dashboard/AddSavingModal';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { MonthlyComparisonChart } from '@/components/dashboard/MonthlyComparisonChart';
import { StatementUploadCard } from '@/components/dashboard/StatementUploadCard';
import { AIChatAssistant } from '@/components/dashboard/AIChatAssistant';
import { VoiceExpenseInput } from '@/components/dashboard/VoiceExpenseInput';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  Category,
  Expense,
  HabitAlert,
  categoryColors,
  type SpendingByCategory,
} from '@/lib/mockData';
import { categories } from '@/lib/mockData';
import { toast } from '@/components/ui/sonner';
import {
  classifyExpense,
  computeCategoryCap,
  reconcileSavingsLedger,
  recordOptimizedSaving,
  recomputeAlerts,
  type SavingsSummary,
  requestGeminiAnalysis,
  requestGeminiChat,
  type AnalysisResult,
} from '@/services/ai';
import {
  createExpense as supabaseCreateExpense,
  deleteExpense as supabaseDeleteExpense,
  fetchExpenses,
  updateExpense as supabaseUpdateExpense,
} from '@/services/supabaseExpenses';
import { useAuth } from '@/context/AuthContext';
import { parseBankStatement, type StatementParseResult } from '@/services/statement';

const Index = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [alerts, setAlerts] = useState<HabitAlert[]>([]);
  const [savedSummary, setSavedSummary] = useState<SavingsSummary>({ total: 0, prevented: 0, reduced: 0, optimized: 0 });
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botLoading, setBotLoading] = useState(false);
  const [botInput, setBotInput] = useState('');
  const [botMessages, setBotMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([]);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const { user } = useAuth();
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<Category | 'all'>('all');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<'all' | 'month' | 'week'>('month');
  const userKey = user?.email ? user.email.toLowerCase() : 'guest';
  const [monthlyBudget, setMonthlyBudget] = useState(25000);
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState('25000');

  useEffect(() => {
    const storedBudget = localStorage.getItem('expenseai-monthly-budget');
    if (storedBudget) {
      const parsed = Number(storedBudget);
      if (!Number.isNaN(parsed) && parsed > 0) {
        setMonthlyBudget(parsed);
        setMonthlyBudgetInput(String(parsed));
      }
    }

    const mounted = { current: true } as { current: boolean };

    const loadExpenses = async () => {
      if (!user) {
        setExpenses([]);
        setAlerts([]);
        setLoadingExpenses(false);
        return;
      }

      setLoadingExpenses(true);
      try {
        const fetchedExpenses = await fetchExpenses(user.uid);
        if (!mounted.current) return;
        setExpenses(fetchedExpenses);
        setAlerts(recomputeAlerts(fetchedExpenses));
      } catch (error) {
        console.error('Could not load expenses from Supabase:', error);
        const message = error instanceof Error ? error.message : 'Unable to load saved expenses.';
        toast.error(message || 'Unable to load saved expenses. Please refresh or try again later.');
        setExpenses([]);
        setAlerts([]);
      } finally {
        if (mounted.current) setLoadingExpenses(false);
      }
    };

    loadExpenses();
    return () => {
      mounted.current = false;
    };
  }, [user]);

  useEffect(() => {
    const { summary } = reconcileSavingsLedger({ userKey, expenses });
    setSavedSummary(summary);
  }, [expenses, userKey]);

  useEffect(() => {
    (async () => {
      const analysis = await requestGeminiAnalysis(expenses);
      setLastAnalysis(analysis);
      if (isBotOpen && analysis.suggestions?.length) {
        setBotMessages((msgs) => [{ role: 'ai', text: analysis.suggestions[0] }, ...msgs]);
      }
    })();
  }, [expenses, isBotOpen]);

  useEffect(() => {
    localStorage.setItem('expenseai-monthly-budget', String(monthlyBudget));
  }, [monthlyBudget]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const impulseSpending = expenses.filter((e) => e.isImpulse).reduce((sum, exp) => sum + exp.amount, 0);
  const badAlerts = alerts.filter((a) => a.severity === 'bad');
  const potentialSavings = badAlerts.reduce((sum, alert) => sum + alert.savingPotential, 0);
  const [applySavings, setApplySavings] = useState(false);
  const displayedTotal = Math.max(0, totalSpent - (applySavings ? potentialSavings : 0));
  const savingsPct = totalSpent > 0 ? ((applySavings ? potentialSavings : 0) / totalSpent) * 100 : 0;
  const monthlyRemaining = Math.max(0, monthlyBudget - totalSpent);

  const spendingByCategory: SpendingByCategory[] = (() => {
    const totals: Record<Category, number> = {
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      bills: 0,
      subscriptions: 0,
      groceries: 0,
      health: 0,
      other: 0,
    };
    expenses.forEach((e) => {
      totals[e.category] += e.amount;
    });
    const total = Object.values(totals).reduce((s, n) => s + n, 0) || 0;
    return (Object.keys(totals) as Category[])
      .filter((cat) => totals[cat] > 0)
      .map((cat) => ({
        category: cat,
        amount: totals[cat],
        percentage: total ? parseFloat(((totals[cat] / total) * 100).toFixed(1)) : 0,
        color: categoryColors[cat],
      }));
  })();

  const weeklyData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
    const totals: Record<typeof days[number], number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = days[d.getDay()];
      totals[key] += e.amount;
    });
    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    return order.map((day) => ({ day, amount: totals[day] }));
  })();

  const recurringSubscriptions = expenses.filter((expense) => {
    return (
      expense.category === 'subscriptions' ||
      /netflix|spotify|prime|hotstar|youtube|apple|jio|bharti|amazon prime/i.test(expense.description.toLowerCase())
    );
  });

  const recurringCount = Array.from(new Set(recurringSubscriptions.map((expense) => expense.description))).length;
  const recurringTotal = recurringSubscriptions.reduce((sum, expense) => sum + expense.amount, 0);

  const healthScore = Math.max(28, Math.min(96, 92 - (lastAnalysis?.metrics.badHabitCount ?? 0) * 8 - ((lastAnalysis?.metrics.impulseSpending ?? 0) / 1000) * 4));

  const categoryBudgets: Record<Category, number> = {
    food: 5500,
    transport: 3200,
    shopping: 4500,
    entertainment: 3000,
    bills: 8000,
    subscriptions: 1200,
    groceries: 5000,
    health: 1600,
    other: 2400,
  };

  const budgetRows = (Object.keys(categoryBudgets) as Category[]).map((category) => {
    const spent = expenses.filter((expense) => expense.category === category).reduce((sum, item) => sum + item.amount, 0);
    const limit = categoryBudgets[category];
    const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    return { category, spent, limit, percent };
  });

  const monthlyComparisonData = (() => {
    const now = new Date();
    return [3, 2, 1, 0].map((offset) => {
      const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const monthLabel = month.toLocaleString('default', { month: 'short' });
      const actual = expenses
        .filter((expense) => {
          const date = new Date(expense.date);
          return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
        })
        .reduce((sum, item) => sum + item.amount, 0);
      const budget = monthlyBudget;
      return { month: monthLabel, actual, budget };
    });
  })();

  const filteredExpenses = expenses.filter((expense) => {
    const queryMatch = searchQuery
      ? `${expense.description} ${expense.category}`.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const categoryMatch = selectedCategoryFilter === 'all' ? true : expense.category === selectedCategoryFilter;
    if (!queryMatch || !categoryMatch) return false;
    if (selectedPeriodFilter === 'week') {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      return new Date(expense.date) >= sevenDaysAgo;
    }
    if (selectedPeriodFilter === 'month') {
      const now = new Date();
      const date = new Date(expense.date);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }
    return true;
  });

  const isValidCategory = (value: string): value is Category => {
    return [
      'food',
      'transport',
      'shopping',
      'entertainment',
      'bills',
      'subscriptions',
      'groceries',
      'health',
      'travel',
      'family',
      'friends',
      'emi',
      'medical',
      'education',
      'investment',
      'recharge',
      'utilities',
      'other',
    ].includes(value as Category);
  };

  const generateId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return (crypto as Crypto).randomUUID();
    }
    return `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  };

  const handleAddExpense = async (newExpense: ExpenseFormPayload) => {
    if (!user) {
      toast.error('Please sign in before adding expenses.');
      return;
    }

    const attemptId = generateId();
    const now = new Date();
    let finalAmount = newExpense.amount;

    if (applySavings) {
      const cap = computeCategoryCap({ expenses, alerts: badAlerts, category: newExpense.category, now });
      if (cap !== null) {
        const monthTotal = expenses
          .filter((e) => {
            const d = new Date(e.date);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && e.category === newExpense.category;
          })
          .reduce((s, e) => s + e.amount, 0);
        const remaining = Math.max(0, cap - monthTotal);
        if (remaining <= 0) {
          recordOptimizedSaving({
            userKey,
            expenseId: attemptId,
            category: newExpense.category,
            amount: newExpense.amount,
            reason: 'Overspend blocked by savings cap',
            now,
          });
          const { summary } = reconcileSavingsLedger({ userKey, expenses, now });
          setSavedSummary(summary);
          toast('Spending capped', { description: `This ${newExpense.category} expense was blocked. ₹${newExpense.amount.toFixed(0)} counted as Saved.` });
          return;
        }
        if (newExpense.amount > remaining) {
          const blocked = newExpense.amount - remaining;
          finalAmount = remaining;
          recordOptimizedSaving({
            userKey,
            expenseId: attemptId,
            category: newExpense.category,
            amount: blocked,
            reason: 'Overspend reduced by savings cap',
            now,
          });
          toast('Spending optimized', { description: `Reduced by ₹${blocked.toFixed(0)} and counted as Saved.` });
        }
      }
    }

    const expenseBase: Expense = {
      id: attemptId,
      description: newExpense.description,
      amount: finalAmount,
      category: newExpense.category,
      date: now,
      isImpulse: false,
      source: 'MANUAL',
      merchant: newExpense.merchant,
      paymentMethod: newExpense.paymentMethod,
      notes: newExpense.notes,
      tags: newExpense.tags,
      receiptUrl: newExpense.receiptUrl,
    };
    const { flags } = classifyExpense(expenseBase, expenses);
    const expense: Expense = { ...expenseBase, isImpulse: flags.impulse };

    try {
      const savedExpense = await supabaseCreateExpense(user.uid, expense);
      const nextExpenses = [savedExpense, ...expenses];
      setExpenses(nextExpenses);
      setAlerts(recomputeAlerts(nextExpenses));
      const { summary } = reconcileSavingsLedger({ userKey, expenses: nextExpenses, now });
      setSavedSummary(summary);
      requestGeminiAnalysis(nextExpenses).then(setLastAnalysis).catch(() => {});
      toast.success('Expense added', {
        description: `${savedExpense.description} - ₹${savedExpense.amount.toFixed(0)} (${savedExpense.category})`,
      });
    } catch (error) {
      console.error('Failed to save expense:', error);
      const message = error instanceof Error ? error.message : 'Could not save expense. Please try again.';
      toast.error(message);
    }
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
    toast('Alert dismissed', { description: 'This habit alert has been removed from the list.' });
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleUpdateExpense = async (updated: ExpenseFormPayload) => {
    if (!user || !editingExpense) {
      toast.error('Please sign in before editing expenses.');
      return;
    }

    const withoutCurrent = expenses.filter((item) => item.id !== editingExpense.id);
    const expenseBase: Expense = {
      ...editingExpense,
      description: updated.description,
      amount: updated.amount,
      category: updated.category,
      merchant: updated.merchant,
      paymentMethod: updated.paymentMethod,
      notes: updated.notes,
      tags: updated.tags,
      receiptUrl: updated.receiptUrl,
      isImpulse: false,
    };
    const { flags } = classifyExpense(expenseBase, withoutCurrent);
    const expenseToSave: Expense = { ...expenseBase, isImpulse: flags.impulse };

    try {
      const savedExpense = await supabaseUpdateExpense(editingExpense.id, user.uid, {
        description: expenseToSave.description,
        amount: expenseToSave.amount,
        category: expenseToSave.category,
        isImpulse: expenseToSave.isImpulse,
        source: expenseToSave.source,
      });
      const next = expenses.map((item) => (item.id === savedExpense.id ? savedExpense : item));
      setExpenses(next);
      setAlerts(recomputeAlerts(next));
      const { summary } = reconcileSavingsLedger({ userKey, expenses: next });
      setSavedSummary(summary);
      requestGeminiAnalysis(next).then(setLastAnalysis).catch(() => {});
      toast.success('Expense updated', {
        description: `${savedExpense.description} - ₹${savedExpense.amount.toFixed(0)} (${savedExpense.category})`,
      });
      setEditingExpense(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update expense:', error);
      toast.error('Could not update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) {
      toast.error('Please sign in before deleting expenses.');
      return;
    }

    const target = expenses.find((e) => e.id === id);
    if (!target) return;
    if (target.source !== 'MANUAL') return;

    try {
      await supabaseDeleteExpense(id, user.uid);
      const next = expenses.filter((e) => e.id !== id);
      setExpenses(next);
      const nextAlerts = recomputeAlerts(next);
      setAlerts(nextAlerts);
      const { summary } = reconcileSavingsLedger({ userKey, expenses: next });
      setSavedSummary(summary);
      requestGeminiAnalysis(next).then(setLastAnalysis).catch(() => {});
      toast('Expense deleted', { description: 'Dashboard recalculated.' });
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('Could not delete expense. Please try again.');
    }
  };

  const handleDuplicateExpense = async (expense: Expense) => {
    if (!user) {
      toast.error('Please sign in before duplicating expenses.');
      return;
    }

    const duplicatePayload: ExpenseFormPayload = {
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      merchant: expense.merchant,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes ? `${expense.notes} (duplicate)` : undefined,
      tags: expense.tags,
      receiptUrl: expense.receiptUrl,
    };

    await handleAddExpense(duplicatePayload);
    toast.success('Expense duplicated', { description: 'A copy was added to your dashboard.' });
  };

  const handleStatementParse = async (result: StatementParseResult) => {
    if (!user) {
      toast.error('Sign in to import statements.');
      return;
    }

    if (!result.transactions.length) {
      throw new Error(result.errors?.[0] || 'No transactions were parsed.');
    }

    const parsedExpenses: Expense[] = result.transactions.map((transaction) => ({
      id: generateId(),
      description: transaction.description,
      amount: transaction.amount,
      category: isValidCategory(transaction.category) ? transaction.category : 'other',
      date: new Date(transaction.date),
      isImpulse: false,
      source: 'AUTO',
    }));

    try {
      const saved: Expense[] = [];
      const failed: Array<{ expense: Expense; error: any }> = [];
      for (const expense of parsedExpenses) {
        try {
          const s = await supabaseCreateExpense(user.uid, expense);
          saved.push(s);
        } catch (err) {
          console.error('Failed to save parsed expense', expense, err);
          failed.push({ expense, error: err });
        }
      }

      if (saved.length > 0) {
        const next = [...saved, ...expenses];
        setExpenses(next);
        setAlerts(recomputeAlerts(next));
        const { summary } = reconcileSavingsLedger({ userKey, expenses: next });
        setSavedSummary(summary);
        requestGeminiAnalysis(next).then(setLastAnalysis).catch(() => {});
      }

      if (failed.length === 0) {
        toast.success('Statement imported', { description: `${saved.length} transactions added to your dashboard.` });
      } else if (saved.length > 0) {
        const firstErr = failed[0].error;
        const msg = firstErr?.message || JSON.stringify(firstErr) || 'One or more transactions failed to save.';
        toast.warn('Partial import', { description: `${saved.length} saved, ${failed.length} failed. ${msg}` });
      } else {
        const firstErr = failed[0]?.error;
        console.error('Imported statement failed:', firstErr);
        const msg = firstErr?.message || JSON.stringify(firstErr) || 'Could not save imported transactions. Please try again.';
        toast.error(msg);
      }
    } catch (error) {
      console.error('Imported statement unexpected error:', error);
      toast.error('Could not save imported transactions. Please try again.');
    }
  };

  const ExpenseListSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-[1.75rem] border border-border bg-card/5 p-4 shadow-sm animate-pulse transition-colors">
          <div className="mb-3 h-3 w-1/3 rounded-full bg-muted/10" />
          <div className="mb-4 h-3 w-2/3 rounded-full bg-muted/10" />
          <div className="flex items-center justify-between gap-3">
            <div className="h-2.5 w-20 rounded-full bg-muted/10" />
            <div className="h-2.5 w-24 rounded-full bg-muted/10" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-200">
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <Header alertCount={alerts.length} />

      <main className="container mx-auto px-4 py-6 pb-24 relative z-10">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <Sidebar />
          <div className="space-y-6">
        <motion.section id="overview" className="mb-8 grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-border bg-card p-8 shadow-md transition-colors"
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-2xl space-y-4">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-600">Welcome back</p>
                <h1 className="text-4xl font-bold leading-tight text-foreground font-display">A calmer, smarter way to manage your money.</h1>
                <p className="text-sm leading-7 text-muted-foreground">Get a clear view of your spending, savings, and trends with elegant insights that help you act fast.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-xl transition-all"
                >
                  Add expense
                </Button>
                <Button
                  onClick={() => {
                    const upload = document.createElement('input');
                    upload.type = 'file';
                    upload.accept = '.csv,.pdf';
                    upload.onchange = async (event) => {
                      const file = (event.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      try {
                        const result = await parseBankStatement(file);
                        await handleStatementParse(result);
                      } catch (error) {
                        toast.error((error as Error).message || 'Unable to import statement.');
                      }
                    };
                    upload.click();
                  }}
                  className="rounded-full border border-border bg-card/5 px-6 py-3 text-sm text-foreground hover:bg-card/10 transition-colors"
                >
                  Import statement
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-[1.75rem] border border-border bg-card p-5 text-foreground shadow-sm transition-colors">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Monthly budget</p>
                <p className="mt-4 text-4xl font-semibold font-display">₹{monthlyBudget.toLocaleString()}</p>
                <p className="mt-3 text-sm text-muted-foreground">Target for this month</p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-card p-5 text-foreground shadow-sm transition-colors">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Total spent</p>
                <p className="mt-4 text-4xl font-semibold font-display">₹{displayedTotal.toFixed(0)}</p>
                <p className="mt-3 text-sm text-muted-foreground">{applySavings ? 'After savings applied' : 'This month'}</p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-card p-5 text-foreground shadow-sm transition-colors">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Remaining</p>
                <p className="mt-4 text-4xl font-semibold font-display">₹{monthlyRemaining.toLocaleString()}</p>
                <p className="mt-3 text-sm text-muted-foreground">Available budget</p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-primary p-5 text-primary-foreground shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Potential savings</p>
                <p className="mt-4 text-4xl font-semibold font-display">₹{potentialSavings}</p>
                <p className="mt-3 text-sm text-muted-foreground">Smart suggestions from AI</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
            <AIInsightsPanel analysis={lastAnalysis} recurringCount={recurringCount} recurringTotal={recurringTotal} healthScore={healthScore} />
            <div className="space-y-4">
              <StatementUploadCard onParse={handleStatementParse} />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
            <VoiceExpenseInput onCreateExpense={handleAddExpense} />
            <AIChatAssistant expenses={expenses} />
          </div>

          <motion.section className="mb-8 rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-colors">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-600">Monthly budget</p>
                <h2 className="text-3xl font-semibold text-foreground">Set or update your monthly plan</h2>
                <p className="text-sm leading-6 text-muted-foreground">The dashboard uses this value to compare actual spending, remaining budget, and savings progress.</p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-card/5 p-5">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-muted-foreground">Monthly budget</label>
                    <input
                      type="number"
                      value={monthlyBudgetInput}
                      onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const budget = Math.max(1000, Number(monthlyBudgetInput) || monthlyBudget);
                      setMonthlyBudget(budget);
                      setMonthlyBudgetInput(String(budget));
                      toast.success('Monthly budget set', { description: `Your monthly budget is now ₹${budget.toLocaleString()}.` });
                    }}
                    className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-xl transition-all"
                  >
                    Save monthly budget
                  </Button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.75rem] border border-border bg-card px-4 py-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Current budget</p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">₹{monthlyBudget.toLocaleString()}</p>
                    </div>
                    <div className="rounded-[1.75rem] border border-border bg-card px-4 py-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Remaining this month</p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">₹{monthlyRemaining.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <StatCard title="Total Spent" value={`₹${displayedTotal.toFixed(0)}`} subtitle={applySavings ? 'This month (after savings)' : 'This month'} icon={Wallet} trend={{ value: Math.round(applySavings ? savingsPct : 0), isPositive: applySavings }} />
              <StatCard title="Potential Savings" value={`₹${potentialSavings}`} subtitle="Per month" icon={Target} variant="primary" />
              <StatCard title="Impulse Spending" value={`₹${impulseSpending.toFixed(0)}`} subtitle={`${totalSpent ? ((impulseSpending / totalSpent) * 100).toFixed(0) : 0}% of total`} icon={TrendingDown} variant="warning" />
              <StatCard title="Bad Habits" value={badAlerts.length.toString()} subtitle="Detected patterns" icon={AlertTriangle} variant="default" />
            </div>

            <Button
              variant={applySavings ? 'outline' : 'default'}
              onClick={() => {
                setApplySavings((v) => !v);
                if (!applySavings) {
                  toast.success('Potential savings applied', { description: `New total: ₹${Math.max(0, totalSpent - potentialSavings).toFixed(0)}` });
                } else {
                  toast('Savings removed', { description: `Total restored: ₹${totalSpent.toFixed(0)}` });
                }
              }}
              className="w-full rounded-full bg-card/10 text-foreground hover:bg-card/15"
            >
              {applySavings ? 'Remove Applied Savings' : 'Apply Potential Savings'}
            </Button>
          </div>
        </motion.section>

        <motion.section id="reports" className="mb-8 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <MonthlyComparisonChart data={monthlyComparisonData} />
          <ReportGenerator expenses={expenses} healthScore={healthScore} totalSpent={displayedTotal} savingsPotential={potentialSavings} />
        </motion.section>

        <motion.section className="mb-8 grid gap-6 xl:grid-cols-[1fr,1fr]">
          <BudgetTracker budgets={budgetRows} monthlyBudget={monthlyBudget} onCategoryClick={(category) => navigate(`/dashboard/category/${category.replace(/\s+/g, '-')}`)} />
          <FinancialHealth healthScore={healthScore} impulseSpending={impulseSpending} totalSpent={totalSpent} savingsPct={savingsPct} recurringTotal={recurringTotal} badHabitsCount={badAlerts.length} />
        </motion.section>

        {badAlerts.length > 0 && (
          <motion.section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold font-display text-foreground">🚨 Bad Habit Alerts</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button>
            </div>
            <div className="space-y-4">
              {badAlerts.map((alert) => (
                <HabitAlertCard key={alert.id} alert={alert} onDismiss={handleDismissAlert} />
              ))}
            </div>
          </motion.section>
        )}

        <motion.section className="mb-8 grid gap-6 xl:grid-cols-[0.7fr,1.3fr]">
          <SpendingChart data={spendingByCategory} />
          <WeeklyTrendChart data={weeklyData} />
        </motion.section>

        <motion.section id="expenses">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-foreground">Recent Expenses</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">See all</Button>
          </div>
          {loadingExpenses ? (
            <ExpenseListSkeleton />
          ) : (
            <ExpenseList
              expenses={filteredExpenses.slice(0, 10)}
              onDelete={handleDeleteExpense}
              onEdit={handleEditExpense}
              onDuplicate={handleDuplicateExpense}
            />
          )}
        </motion.section>
          </div>
        </div>
      </main>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="fixed bottom-6 left-6 flex flex-col gap-3"
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-xl transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </Button>
        <Button
          onClick={() => setIsSavedOpen(true)}
          className="rounded-full bg-card/10 px-5 py-3 text-sm font-semibold text-foreground hover:bg-card/15"
        >
          <BadgeCheck className="h-5 w-5 mr-2" />
          Saved
        </Button>
        <Button
          onClick={async () => {
            setIsBotOpen((v) => !v);
            if (!isBotOpen) {
              setBotLoading(true);
              try {
                const analysis = await requestGeminiAnalysis(expenses);
                setLastAnalysis(analysis);
                setBotMessages([
                  { role: 'ai', text: analysis.shortExplanations?.[0] || 'I will watch your spending patterns and suggest gentle improvements.' },
                  ...(analysis.suggestions?.slice(0, 2).map((s) => ({ role: 'ai' as const, text: s })) ?? []),
                ]);
              } finally {
                setBotLoading(false);
              }
            }
          }}
          className="rounded-full bg-card/10 px-5 py-3 text-sm font-semibold text-foreground hover:bg-card/15"
        >
          AI Suggestions
        </Button>
      </motion.div>

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddExpense} />
      <AddExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleUpdateExpense}
        initialExpense={editingExpense ? { description: editingExpense.description, amount: editingExpense.amount, category: editingExpense.category } : undefined}
        title="Edit Expense"
        submitLabel="Save Changes"
      />
      <AddSavingModal isOpen={isSavedOpen} onClose={() => setIsSavedOpen(false)} summary={savedSummary} />

      {isBotOpen && (
        <div className="fixed bottom-24 left-6 z-40 w-[min(420px,90vw)] rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">AI Chatbot</div>
            <Button variant="ghost" size="sm" onClick={() => setIsBotOpen(false)}>Close</Button>
          </div>
          <div className="mb-3 max-h-72 overflow-auto space-y-3 border-t border-border pt-4">
            {botLoading && <div className="text-sm text-muted-foreground">Analyzing your expenses…</div>}
            {!botLoading && botMessages.length === 0 && <div className="text-sm text-muted-foreground">Ask a finance question like “How can I save on groceries?”</div>}
            {botMessages.map((message, idx) => (
              <div key={idx} className={`rounded-2xl p-3 ${message.role === 'ai' ? 'bg-card/5 text-foreground' : 'bg-primary/15 text-primary-foreground'}`}>
                {message.text}
              </div>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const query = botInput.trim();
              if (!query) return;
              setBotMessages((msgs) => [...msgs, { role: 'user', text: query }]);
              setBotInput('');
              try {
                const { reply } = await requestGeminiChat(expenses, query);
                setBotMessages((msgs) => [...msgs, { role: 'ai', text: reply }]);
              } catch {
                setBotMessages((msgs) => [...msgs, { role: 'ai', text: 'I had trouble reaching the AI service. Try again shortly.' }]);
              }
            }}
          >
            <input
              className="flex-1 rounded-2xl border border-border bg-card/10 px-4 py-3 text-sm text-foreground outline-none focus:border-cyan-400/50"
              placeholder="Ask for help: e.g. reduce food spending"
              value={botInput}
              onChange={(e) => setBotInput(e.target.value)}
            />
            <Button type="submit" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Send</Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Index;
