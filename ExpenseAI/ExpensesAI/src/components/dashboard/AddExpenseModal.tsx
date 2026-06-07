import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categories, Category, categoryIcons, Expense } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export interface ExpenseFormPayload {
  description: string;
  amount: number;
  category: Category;
  merchant?: string;
  paymentMethod?: string;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (expense: ExpenseFormPayload) => Promise<void> | void;
  onSave?: (expense: ExpenseFormPayload) => Promise<void> | void;
  initialExpense?: Pick<Expense, 'description' | 'amount' | 'category' | 'merchant' | 'notes' | 'paymentMethod' | 'tags' | 'receiptUrl'>;
  title?: string;
  submitLabel?: string;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onAdd,
  onSave,
  initialExpense,
  title = 'Add Expense',
  submitLabel = 'Add Expense',
}: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialExpense) {
      setDescription(initialExpense.description);
      setAmount(initialExpense.amount.toString());
      setSelectedCategory(initialExpense.category);
      setSelectedCategoryLabel(initialExpense.category);
      setMerchant(initialExpense.merchant || '');
      setPaymentMethod(initialExpense.paymentMethod || 'Cash');
      setNotes(initialExpense.notes || '');
      setTagsInput(initialExpense.tags?.join(', ') || '');
      setReceiptUrl(initialExpense.receiptUrl);
    } else {
      setDescription('');
      setAmount('');
      setMerchant('');
      setPaymentMethod('Cash');
      setNotes('');
      setTagsInput('');
      setReceiptUrl(undefined);
      setSelectedCategory(null);
      setSelectedCategoryLabel(null);
      setIsAddingCategory(false);
      setNewCategoryLabel('');
    }
  }, [isOpen, initialExpense]);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);

    if (value.length > 3) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const lowerValue = value.toLowerCase();
        if (/(uber|ola|metro|taxi|bus|train|flight)/.test(lowerValue)) {
          setSelectedCategory('transport');
          setSelectedCategoryLabel('transport');
        } else if (/(swiggy|zomato|mcdonald|pizza|restaurant|dine)/.test(lowerValue)) {
          setSelectedCategory('food');
          setSelectedCategoryLabel('food');
        } else if (/(amazon|flipkart|myntra|mall|shop)/.test(lowerValue)) {
          setSelectedCategory('shopping');
          setSelectedCategoryLabel('shopping');
        } else if (/(netflix|spotify|hotstar|prime|disney|subscription)/.test(lowerValue)) {
          setSelectedCategory('subscriptions');
          setSelectedCategoryLabel('subscriptions');
        } else if (/(electricity|water|gas|bill|rent)/.test(lowerValue)) {
          setSelectedCategory('bills');
          setSelectedCategoryLabel('bills');
        } else if (/(grocery|groceries|supermarket|dmart|bigbasket)/.test(lowerValue)) {
          setSelectedCategory('groceries');
          setSelectedCategoryLabel('groceries');
        } else if (/(movie|ticket|cinema)/.test(lowerValue)) {
          setSelectedCategory('movies');
          setSelectedCategoryLabel('movies');
        } else if (/(hotel|travel|flight|taxi)/.test(lowerValue)) {
          setSelectedCategory('travel');
          setSelectedCategoryLabel('travel');
        }
        setIsAnalyzing(false);
      }, 500);
    }
  };

  const handleReceiptUpload = async (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        setReceiptUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!description || !amount || !selectedCategory) return;

    const descriptionWithLabel =
      selectedCategory === 'other' && selectedCategoryLabel
        ? `${description} [${selectedCategoryLabel}]`
        : description;

    const payload: ExpenseFormPayload = {
      description: descriptionWithLabel,
      amount: parseFloat(amount),
      category: selectedCategory,
      merchant: merchant || undefined,
      paymentMethod: paymentMethod || undefined,
      notes: notes || undefined,
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      receiptUrl,
    };

    try {
      if (onSave) {
        await onSave(payload);
      } else if (onAdd) {
        await onAdd(payload);
      }
      onClose();
    } catch (error) {
      console.error('Expense modal submit failed:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-display text-foreground">{title}</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <div className="relative">
                    <Input
                      id="description"
                      placeholder="e.g., Uber Eats - Pizza"
                      value={description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      className="pr-10"
                    />
                    {isAnalyzing && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Sparkles className="h-4 w-4 animate-pulse text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  {selectedCategory && !isAnalyzing && (
                    <p className="flex items-center gap-1 text-xs text-primary-foreground">
                      <Sparkles className="h-3 w-3" />
                      AI suggested: {categoryIcons[selectedCategory]} {selectedCategory}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="merchant">Merchant</Label>
                    <Input
                      id="merchant"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      placeholder="e.g. Netflix, Amazon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment method</Label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-0"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Wallet">Wallet</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Add a short note for this expense"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="e.g. work, grocery, travel"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">Receipt</Label>
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleReceiptUpload(e.target.files?.[0] ?? undefined)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none"
                  />
                  {receiptUrl && (
                    <img src={receiptUrl} alt="Receipt preview" className="mt-2 max-h-40 w-full rounded-2xl object-contain border border-border" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedCategoryLabel(category);
                        }}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border-2 p-3 text-sm transition-all text-left',
                          selectedCategory === category
                            ? 'border-primary bg-primary/10 text-primary-foreground'
                              : 'border-border bg-card hover:border-primary/50 text-muted-foreground'
                        )}
                      >
                        <span>{categoryIcons[category]}</span>
                        <span className="truncate">{category}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory((v) => !v)}
                    className="mt-2 inline-flex items-center justify-center rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary/70"
                  >
                    + Add custom category
                  </button>
                  {isAddingCategory && (
                    <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                      <Input
                        placeholder="Category name"
                        value={newCategoryLabel}
                        onChange={(e) => setNewCategoryLabel(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const label = newCategoryLabel.trim().toLowerCase();
                          if (!label) return;
                          setSelectedCategory('unknown');
                          setSelectedCategoryLabel(label);
                          setIsAddingCategory(false);
                          setNewCategoryLabel('');
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground"
                  disabled={!description || !amount || !selectedCategory}
                >
                  {submitLabel}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
