import { supabase } from '@/lib/supabase';
import { Category, Expense } from '@/lib/mockData';

interface ExpenseRow {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: Category;
  date: string | Date;
  is_impulse: boolean;
  source: 'MANUAL' | 'AUTO';
  notes?: string | null;
  merchant?: string | null;
  payment_method?: string | null;
  tags?: string | null;
  receipt_url?: string | null;
  is_recurring?: boolean | null;
}

const mapRowToExpense = (row: ExpenseRow): Expense => ({
  id: row.id,
  description: row.description,
  amount: row.amount,
  category: row.category,
  date: row.date instanceof Date ? row.date : new Date(row.date),
  isImpulse: row.is_impulse,
  source: row.source,
  notes: row.notes ?? undefined,
  merchant: row.merchant ?? undefined,
  paymentMethod: row.payment_method ?? undefined,
  tags: row.tags ? row.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined,
  receiptUrl: row.receipt_url ?? undefined,
  isRecurring: Boolean(row.is_recurring),
});

export async function fetchExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from<ExpenseRow>('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('fetchExpenses error:', error);
    throw error;
  }

  return data ?? [];
}

export async function createExpense(
  userId: string,
  payload: Omit<Expense, 'id' | 'date'> & { id: string; date: Date }
): Promise<Expense> {
  const insertPayload: Partial<ExpenseRow> = {
    id: payload.id,
    user_id: userId,
    description: payload.description,
    amount: payload.amount,
    category: payload.category,
    date: payload.date.toISOString(),
    is_impulse: payload.isImpulse ?? false,
    source: payload.source ?? 'MANUAL',
  };

  if (payload.notes !== undefined) insertPayload.notes = payload.notes;
  if (payload.merchant !== undefined) insertPayload.merchant = payload.merchant;
  if (payload.paymentMethod !== undefined) insertPayload.payment_method = payload.paymentMethod;
  if (payload.tags !== undefined) insertPayload.tags = payload.tags.join(',');
  if (payload.receiptUrl !== undefined) insertPayload.receipt_url = payload.receiptUrl;
  // isRecurring may not exist in all DB setups; only include if explicitly provided
  if ((payload as any).isRecurring !== undefined) insertPayload.is_recurring = (payload as any).isRecurring;

  const { data, error } = await supabase.from<ExpenseRow>('expenses').insert([insertPayload]).select().single();

  if (error) throw error;
  if (!data) throw new Error('Unable to save expense.');
  return mapRowToExpense(data);
}

export async function deleteExpense(expenseId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from<ExpenseRow>('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateExpense(
  expenseId: string,
  userId: string,
  updates: Partial<Omit<Expense, 'id' | 'date'>> & { date?: Date }
): Promise<Expense> {
  const payload: Partial<ExpenseRow> = {};

  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.date !== undefined) payload.date = updates.date.toISOString();
  if (updates.isImpulse !== undefined) payload.is_impulse = updates.isImpulse;
  if (updates.source !== undefined) payload.source = updates.source;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.merchant !== undefined) payload.merchant = updates.merchant;
  if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
  if (updates.tags !== undefined) payload.tags = updates.tags.join(',');
  if (updates.receiptUrl !== undefined) payload.receipt_url = updates.receiptUrl;

  const { data, error } = await supabase
    .from<ExpenseRow>('expenses')
    .update(payload)
    .eq('id', expenseId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Unable to update expense.');
  return mapRowToExpense(data);
}
