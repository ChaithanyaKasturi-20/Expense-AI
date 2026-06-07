import { motion } from 'framer-motion';
import { Download, FileText, BarChart3, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Expense, Category, categoryIcons, categoryColors } from '@/lib/mockData';
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';

interface ReportGeneratorProps {
  expenses: Expense[];
  healthScore: number;
  totalSpent: number;
  savingsPotential: number;
}

export function ReportGenerator({ expenses, healthScore, totalSpent, savingsPotential }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const categoryTotals: Record<string, number> = {};
      expenses.forEach((exp) => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] ?? 0) + exp.amount;
      });

      // Prepare monthly totals for trend chart
      const monthlyTotals: Record<string, number> = {};
      expenses.forEach((exp) => {
        const d = new Date(exp.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[key] = (monthlyTotals[key] ?? 0) + exp.amount;
      });

      const categoryLabels = Object.keys(categoryTotals).map((c) => c.charAt(0).toUpperCase() + c.slice(1));
      const categoryValues = Object.values(categoryTotals).map((n) => Number(n.toFixed(0)));

      const monthLabels = Object.keys(monthlyTotals).sort();
      const monthValues = monthLabels.map((k) => Number(monthlyTotals[k].toFixed(0)));

      const reportHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #0f172a; }
              .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              h1 { margin: 0 0 8px 0; font-size: 32px; color: #0f172a; }
              .subtitle { color: #64748b; margin-bottom: 32px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.28em; }
              .section { margin-bottom: 32px; }
              .section h2 { margin: 0 0 16px 0; font-size: 20px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
              .metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
              .metric { background: #f1f5f9; padding: 16px; border-radius: 12px; }
              .metric-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.24em; color: #64748b; margin-bottom: 8px; }
              .metric-value { font-size: 24px; font-weight: 600; color: #0f172a; }
              .category-list { display: grid; gap: 12px; }
              .category-item { display: flex; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6; }
              .category-name { font-weight: 500; color: #0f172a; }
              .category-amount { color: #64748b; font-weight: 600; }
              footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
              .timestamp { font-size: 12px; color: #94a3b8; margin-bottom: 32px; }
              .chart-wrap { display:flex; gap:24px; align-items:center; justify-content:space-between; flex-wrap:wrap }
              .chart-card { background: #fff; padding: 12px; border-radius: 12px; box-shadow: 0 1px 2px rgba(2,6,23,0.04); }
              canvas { display:block; }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          </head>
          <body>
            <div class="container">
              <h1>Expense Report</h1>
              <p class="subtitle">Monthly financial overview</p>
              <p class="timestamp">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>

              <div class="section">
                <h2>Summary</h2>
                <div class="metrics">
                  <div class="metric">
                    <div class="metric-label">Total Spent</div>
                    <div class="metric-value">₹${totalSpent.toFixed(0)}</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Health Score</div>
                    <div class="metric-value">${healthScore}%</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Potential Savings</div>
                    <div class="metric-value">₹${savingsPotential.toFixed(0)}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>Spending by Category</h2>
                <div class="chart-wrap">
                  <div class="chart-card" style="flex:1; min-width:260px">
                    <canvas id="categoryChart" width="380" height="280"></canvas>
                  </div>
                  <div class="chart-card" style="flex:1; min-width:360px">
                    <canvas id="trendChart" width="520" height="280"></canvas>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>Recommendations</h2>
                <ul style="line-height: 1.8; color: #475569;">
                  <li>Review subscriptions and recurring charges monthly</li>
                  <li>Set category-based budgets to control impulse spending</li>
                  <li>Track merchant patterns to identify savings opportunities</li>
                  <li>Use the monthly comparison to monitor spending trends</li>
                </ul>
              </div>

              <footer>
                <p>This report was automatically generated by ExpenseAI. For questions, visit your dashboard.</p>
              </footer>
            </div>

            <script>
              // Data injected from the app
              const categoryLabels = ${JSON.stringify(categoryLabels)};
              const categoryValues = ${JSON.stringify(categoryValues)};
              const monthLabels = ${JSON.stringify(monthLabels)};
              const monthValues = ${JSON.stringify(monthValues)};

              // Colors
              const palette = [
                '#3b82f6','#06b6d4','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec4899','#94a3b8'
              ];

              // Category doughnut
              const ctx = document.getElementById('categoryChart').getContext('2d');
              new Chart(ctx, {
                type: 'doughnut',
                data: {
                  labels: categoryLabels,
                  datasets: [{ data: categoryValues, backgroundColor: palette.slice(0, categoryLabels.length) }]
                },
                options: { responsive: false, plugins: { legend: { position: 'bottom' } } }
              });

              // Monthly trend bar
              const ctx2 = document.getElementById('trendChart').getContext('2d');
              new Chart(ctx2, {
                type: 'bar',
                data: {
                  labels: monthLabels.map(m => {
                    const [y,mm] = m.split('-');
                    return new Date(Number(y), Number(mm)-1, 1).toLocaleString('default', { month: 'short', year: 'numeric' });
                  }),
                  datasets: [{ label: 'Spent', data: monthValues, backgroundColor: '#3b82f6' }]
                },
                options: { responsive: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
              });
            </script>
          </body>
        </html>
      `;

      const blob = new Blob([reportHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expense-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsGenerating(false);
      toast.success('Report downloaded', { description: 'Your expense report is ready.' });
    }, 1000);
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Export & Share</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">Generate Report</h3>
        </div>
        <div className="rounded-3xl bg-card/5 p-3 text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">Download a detailed monthly report with category breakdowns, spending trends, and personalized recommendations.</p>

      <div className="space-y-3">
        <motion.button
          onClick={generateReport}
          disabled={isGenerating}
          whileHover={{ scale: isGenerating ? 1 : 1.02 }}
          whileTap={{ scale: isGenerating ? 1 : 0.98 }}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Report
            </>
          )}
        </motion.button>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="rounded-full border border-border bg-card text-foreground hover:bg-card/5 px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2">
            <BarChart3 className="h-4 w-4" />
            View Charts
          </Button>
          <Button className="rounded-full border border-border bg-card text-foreground hover:bg-card/5 px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            Email Report
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-card/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">What's included</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted" />
            Monthly spending summary
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted" />
            Category breakdown analysis
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted" />
            Health score and recommendations
          </li>
        </ul>
      </div>
    </div>
  );
}
