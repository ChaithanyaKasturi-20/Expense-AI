import { motion } from 'framer-motion';
import { Expense, categoryIcons, categoryColors } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Zap, Pencil, Trash2, Copy, DollarSign } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  onDuplicate?: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onDelete, onEdit, onDuplicate }: ExpenseListProps) {
  return (
    <div className="space-y-3">
      {expenses.map((expense, index) => (
        <motion.div
          key={expense.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'rounded-[1.75rem] bg-card border border-border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg',
            expense.isImpulse && 'ring-1 ring-warning/30'
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn('flex h-12 w-12 items-center justify-center rounded-3xl text-2xl',
                `bg-accent text-accent-foreground`)}
            >
              {categoryIcons[expense.category]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground truncate">{expense.description}</p>
                {expense.isImpulse && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                    <Zap className="h-3 w-3" />
                    Impulse
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(expense.date, 'MMM d, yyyy • h:mm a')}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="font-semibold text-foreground">₹{expense.amount.toFixed(2)}</p>
                <p
                  className="text-xs font-medium uppercase tracking-[0.15em] text-accent-foreground"
                >
                  {expense.category}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                {expense.merchant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 uppercase tracking-[0.24em]">
                    <DollarSign className="h-3.5 w-3.5" /> {expense.merchant}
                  </span>
                )}
                {expense.paymentMethod && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 uppercase tracking-[0.24em]">{expense.paymentMethod}</span>
                )}
              </div>

              {expense.tags?.length ? (
                <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                  {expense.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-muted px-2 py-1">#{tag}</span>
                  ))}
                </div>
              ) : null}

              {expense.notes ? <p className="text-xs text-muted-foreground max-w-[220px] break-words">{expense.notes}</p> : null}

              {expense.source === 'MANUAL' && (onEdit || onDelete || onDuplicate) && (
                <div className="flex flex-wrap items-center gap-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(expense)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground transition hover:border-accent hover:bg-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                  {onDuplicate && (
                    <button
                      type="button"
                      onClick={() => onDuplicate(expense)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground transition hover:border-accent hover:bg-accent"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        const ok = window.confirm('Delete this expense? This action cannot be undone.');
                        if (ok) onDelete(expense.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card/5 px-3 py-1 text-xs text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
