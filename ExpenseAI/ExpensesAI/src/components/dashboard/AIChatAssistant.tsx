import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestGeminiChat, type AIChatResponse } from '@/services/ai';
import { Expense } from '@/lib/mockData';

interface AIChatAssistantProps {
  expenses: Expense[];
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const starterMessages: ChatMessage[] = [
  { role: 'ai', text: 'I’m ExpenseAI — your spending buddy for budgets, subscriptions, and smart expense moves. Ask me something about your money and I’ll give you a fresh, useful answer.' },
];

export function AIChatAssistant({ expenses }: AIChatAssistantProps) {
  const [query, setQuery] = useState('How much did I spend this month?');
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [analysis, setAnalysis] = useState<AIChatResponse['analysis'] | null>(null);
  const [loading, setLoading] = useState(false);

  const spendingTotal = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  const sendMessage = async () => {
    if (!query.trim()) return;
    const messageText = query.trim();
    setMessages((current) => [...current, { role: 'user', text: messageText }]);
    setAnalysis(null);
    setLoading(true);
    setQuery('');

    try {
      const response = await requestGeminiChat(expenses, messageText);
      setMessages((current) => [...current, { role: 'ai', text: response.reply }]);
      setAnalysis(response.analysis ?? null);
    } catch (error) {
      console.error(error);
      setMessages((current) => [...current, { role: 'ai', text: 'I could not get a response from the AI assistant right now. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-border bg-card/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
      id="insights"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-600">AI assistant</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Ask ExpenseAI anything</h2>
        </div>
        <div className="rounded-3xl bg-card/5 px-4 py-3 text-sm text-muted-foreground">
          Total tracked ₹{spendingTotal.toFixed(0)}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3 rounded-3xl border border-border bg-card/5 p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-3xl p-4 ${message.role === 'ai' ? 'bg-card' : 'bg-primary/10'} ${message.role === 'ai' ? 'text-foreground' : 'text-primary-foreground'}`}
            >
              <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span>{message.role === 'ai' ? 'ExpenseAI' : 'You'}</span>
                <span>{message.role === 'ai' ? 'AI' : 'Sent'}</span>
              </div>
              <p className="mt-2 text-sm leading-6">{message.text}</p>
            </div>
          ))}
        </div>

        {analysis ? (
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Expense Summary</p>
                <h3 className="mt-1 text-base font-semibold text-foreground">AI Data Insight</h3>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{analysis.transactionCount} txns</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{analysis.note}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-card/50 p-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total spent</p>
                <p className="mt-2 text-lg font-semibold">₹{analysis.totalSpent.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-card/50 p-3">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Top categories</p>
                <div className="mt-2 space-y-1">
                  {analysis.topCategories.map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm text-foreground">
                      <span>{item.category}</span>
                      <span>₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <Input
            placeholder="Type a question…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={!query.trim() || loading}
            className="w-full"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
