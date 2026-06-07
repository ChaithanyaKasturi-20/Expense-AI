import { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseBankStatement, StatementParseResult } from '@/services/statement';

interface StatementUploadCardProps {
  onParse: (result: StatementParseResult) => Promise<void>;
}

export function StatementUploadCard({ onParse }: StatementUploadCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showFormat, setShowFormat] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await parseBankStatement(file);
      await onParse(result);
      if (result.transactions.length > 0) {
        setMessage(`✅ Successfully imported ${result.transactions.length} transactions!`);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(result.errors?.[0] || 'No transactions were detected.');
      }
    } catch (error) {
      setMessage((error as Error).message || 'Unable to parse the file.');
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-md dark:shadow-2xl dark:shadow-black/10 dark:backdrop-blur-xl transition-colors"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300/80">Statement import</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Upload bank statement</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">Import CSV statements and let ExpenseAI auto-extract your transactions.</p>
        </div>

        <label className="inline-flex cursor-pointer items-center rounded-2xl bg-cyan-100 dark:bg-cyan-500/15 px-5 py-3 text-sm font-medium text-cyan-700 dark:text-cyan-100 transition hover:bg-cyan-200 dark:hover:bg-cyan-500/25">
          <UploadCloud className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Parsing...' : 'Upload CSV or PDF'}</span>
          <input type="file" accept=".csv,.pdf" onChange={handleFileChange} className="hidden" disabled={isLoading} />
        </label>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-slate-600 dark:text-gray-400 flex-shrink-0" />
        <span className="text-slate-600 dark:text-gray-300">CSV or PDF format supported</span>
        <button
          onClick={() => setShowFormat(!showFormat)}
          className="ml-auto flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          <HelpCircle className="h-4 w-4" />
          Format
        </button>
      </div>

      {showFormat && (
        <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 p-4 space-y-3 text-sm">
          <div>
            <p className="font-medium text-slate-900 dark:text-white mb-2">Expected Format (CSV or PDF):</p>
            <p className="text-slate-600 dark:text-gray-400 mb-2">Your file should contain:</p>
            <ul className="space-y-1 text-slate-600 dark:text-gray-400 ml-4">
              <li>• <strong>Date</strong> (YYYY-MM-DD, DD/MM/YYYY, or MM/DD/YYYY)</li>
              <li>• <strong>Description</strong> (Merchant, vendor, or transaction details)</li>
              <li>• <strong>Amount</strong> (Transaction value)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white mb-2">Example CSV:</p>
            <pre className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto text-xs font-mono text-slate-800 dark:text-slate-200">
{`Date,Description,Amount
2024-01-15,Grocery Store,150.50
2024-01-16,Uber Ride,45.00
2024-01-17,Coffee Shop,5.50
2024-01-18,Salary Deposit,5000.00`}
            </pre>
            <p className="font-medium text-slate-900 dark:text-white mb-2 mt-4">Example PDF:</p>
            <pre className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto text-xs font-mono text-slate-800 dark:text-slate-200">
{`2024-01-15 Grocery Store 150.50\n2024-01-16 Uber Ride 45.00\n2024-01-17 Coffee Shop 5.50\n2024-01-18 Salary Deposit 5000.00`}
            </pre>
          </div>
        </div>
      )}

      {message && (
        <div className={`mt-4 rounded-2xl p-4 text-sm flex items-start gap-3 ${
          message.startsWith('✅')
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-400/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-400/30 text-red-800 dark:text-red-300'
        }`}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 mt-0.5" />}
          <span className="whitespace-pre-wrap">{message}</span>
        </div>
      )}
    </motion.div>
  );
}
