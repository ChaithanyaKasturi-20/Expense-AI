import { useEffect, useMemo, useState } from 'react';
import { Mic, MicOff, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category, Expense } from '@/lib/mockData';

interface VoiceExpenseInputProps {
  onCreateExpense: (expense: { description: string; amount: number; category: Category }) => Promise<void> | void;
}

const categoryMap: Record<string, Category> = {
  food: 'food',
  restaurant: 'food',
  grocery: 'groceries',
  uber: 'transport',
  ola: 'transport',
  taxi: 'transport',
  metro: 'transport',
  flight: 'travel',
  hotel: 'travel',
  netflix: 'subscriptions',
  spotify: 'subscriptions',
  prime: 'subscriptions',
  bill: 'bills',
  rent: 'bills',
  pharmacy: 'health',
  clinic: 'health',
  mall: 'shopping',
  shop: 'shopping',
  friends: 'friends',
  family: 'family',
  emi: 'emi',
  insurance: 'bills',
  recharge: 'recharge',
  utility: 'utilities',
};

function inferCategory(description: string): Category {
  const text = description.toLowerCase();
  for (const keyword of Object.keys(categoryMap)) {
    if (text.includes(keyword)) {
      return categoryMap[keyword];
    }
  }
  return 'other';
}

function parseVoiceExpense(transcript: string) {
  const normalized = transcript.replace(/₹/g, '').replace(/rs\.?/gi, '').replace(/rupees?/gi, '').trim();
  const amountMatch = normalized.match(/(\d+(?:[,\d]*\d)?(?:\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
  const description = normalized.replace(amountMatch?.[0] || '', '').replace(/spent|on|for|rupees?/gi, '').trim();
  return { amount, description: description || 'Voice expense' };
}

export function VoiceExpenseInput({ onCreateExpense }: VoiceExpenseInputProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Tap to start');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const win = window as any;
    if (win.SpeechRecognition || win.webkitSpeechRecognition) {
      setIsSupported(true);
    }
  }, []);

  const recognition = useMemo(() => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const instance = new SpeechRecognition();
    instance.lang = 'en-IN';
    instance.interimResults = false;
    instance.maxAlternatives = 1;
    return instance;
  }, []);

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = async (event: any) => {
      const text = event.results[0]?.[0]?.transcript || '';
      setTranscript(text);
      setStatus('Heard: ' + text);
      setListening(false);
      setError(null);
      const parsed = parseVoiceExpense(text);
      if (!parsed.amount) {
        setError('I could not detect an amount. Try saying: Spend 250 on fuel.');
        setStatus('Tap to retry');
        return;
      }
      const category = inferCategory(parsed.description);
      try {
        setStatus('Saving...');
        await onCreateExpense({ description: parsed.description, amount: parsed.amount, category });
        setStatus('Saved');
        setTimeout(() => setIsOpen(false), 1200);
      } catch (err: any) {
        console.error('Voice save failed:', err);
        setError(err?.message || 'Could not save expense. Please try again.');
        setStatus('Tap to retry');
      }
    };
    recognition.onerror = (event: any) => {
      setError(event.error || 'Voice recognition error');
      setListening(false);
      setStatus('Tap to retry');
    };
    recognition.onend = () => {
      setListening(false);
    };
  }, [recognition, onCreateExpense]);

  const handleStart = () => {
    if (!recognition) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }
    setError(null);
    setTranscript('');
    setListening(true);
    setStatus('Listening... speak clearly');
    recognition.start();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!isSupported}
        className={`fixed right-6 top-24 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          listening
            ? 'bg-red-500/90 hover:bg-red-600 scale-110'
            : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:scale-105'
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Voice expense entry"
      >
        {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="fixed right-6 top-40 z-50 w-80 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Voice entry</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Quick capture</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Say: "Spent 250 on fuel", "Groceries 980", or "Netflix 1200"
          </p>

          <div className="mb-4">
            <Button
              variant={listening ? 'destructive' : 'secondary'}
              size="sm"
              onClick={handleStart}
              disabled={!isSupported}
              className="w-full"
            >
              {listening ? 'Stop' : 'Start'}
            </Button>
          </div>

          <div className="rounded-lg bg-slate-950/70 p-3 text-sm text-gray-200 space-y-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span className="text-xs">{status}</span>
            </div>
            {transcript && (
              <div className="border-l-2 border-cyan-500 pl-2">
                <p className="text-xs text-cyan-100">Heard: {transcript}</p>
              </div>
            )}
            {error && (
              <div className="border-l-2 border-rose-500 pl-2">
                <p className="text-xs text-rose-300">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
