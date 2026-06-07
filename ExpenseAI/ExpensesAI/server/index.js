
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';

const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: envPath });

const app = express();
const PORT = parseInt(process.env.SERVER_PORT || '4000', 10);
const upload = multer({ storage: multer.memoryStorage() });

const openaiApiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '4mb' }));

function normalizeAmount(raw) {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const cleaned = String(raw).replace(/[^0-9.-]+/g, '').trim();
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}

const categoryMap = [
  { keywords: ['uber', 'ola', 'taxi', 'bus', 'train', 'metro', 'flight'], category: 'transport' },
  { keywords: ['swiggy', 'zomato', 'mcdonald', 'pizza', 'dominos', 'restaurant', 'cafe', 'hotel'], category: 'food' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'shop', 'store', 'ebay'], category: 'shopping' },
  { keywords: ['netflix', 'spotify', 'hotstar', 'prime', 'disney', 'apple music', 'spotify'], category: 'subscriptions' },
  { keywords: ['electricity', 'water', 'rent', 'gas', 'bill', 'vodafone', 'jio', 'bharti'], category: 'bills' },
  { keywords: ['grocery', 'supermarket', 'groceries', 'bigbasket', 'dmart', 'nature', 'fresh'], category: 'groceries' },
  { keywords: ['pharmacy', 'clinic', 'hospital', 'doctor', 'medical', 'health'], category: 'health' },
  { keywords: ['flight', 'train', 'bus', 'uber', 'ola', 'travel', 'hotel'], category: 'travel' },
  { keywords: ['school', 'college', 'tuition', 'course', 'education', 'exam'], category: 'education' },
  { keywords: ['emi', 'loan', 'finance', 'bank'], category: 'emi' },
  { keywords: ['mutual', 'investment', 'unit', 'shares', 'fund', 'sip'], category: 'investment' },
  { keywords: ['mobile recharge', 'recharge', 'prepaid', 'postpaid'], category: 'recharge' },
  { keywords: ['utility', 'internet', 'broadband', 'insurance'], category: 'utilities' },
];

function inferCategoryFromDescription(description) {
  const normalized = String(description || '').toLowerCase();
  for (const entry of categoryMap) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.category;
    }
  }
  return 'other';
}

async function classifyWithAI(description) {
  if (!openai) return 'other';

  try {
    const prompt = `Classify the following bank transaction description into one of these categories exactly: food, transport, shopping, entertainment, bills, subscriptions, groceries, health, travel, family, friends, emi, medical, education, investment, recharge, utilities, other. Respond only with one of those category labels and no extra text.\n\nDescription: ${description}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.15,
    });

    const text = response.choices?.[0]?.message?.content || '';
    const label = String(text).trim().toLowerCase();
    if (label && /food|transport|shopping|entertainment|bills|subscriptions|groceries|health|travel|family|friends|emi|medical|education|investment|recharge|utilities|other/.test(label)) {
      return label.match(/food|transport|shopping|entertainment|bills|subscriptions|groceries|health|travel|family|friends|emi|medical|education|investment|recharge|utilities|other/)[0];
    }
  } catch (error) {
    console.error('AI category classification failed:', error?.message || error);
  }

  return 'other';
}

function parseCsvRows(rawText) {
  const lines = rawText.split(/\r?\n/).filter(Boolean);
  const headers = lines[0]?.split(/,|\t|;/).map((header) => header.trim().toLowerCase()) || [];
  const rows = lines.slice(1);
  const transactions = [];

  for (const row of rows) {
    const cells = row.split(/,|\t|;/).map((cell) => cell.trim());
    if (cells.length < 2) continue;
    const dateCell = cells.find((cell) => /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/.test(cell));
    const amountCell = cells.reverse().find((cell) => /-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/.test(cell));
    const descCell = cells.find((cell) => cell && cell !== dateCell && cell !== amountCell) || cells[0];
    const amount = normalizeAmount(amountCell);
    if (!dateCell || !amount) continue;

    transactions.push({
      description: descCell || 'Imported transaction',
      amount,
      date: new Date(dateCell).toISOString(),
      category: inferCategoryFromDescription(descCell),
      source: 'CSV',
    });
  }

  return transactions;
}

function extractTransactionsFromText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\u00A0/g, ' ').trim()).filter(Boolean);
  const matches = [];

  const commonDate = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
  const amountPattern = /(-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/;

  for (const line of lines) {
    const dateMatch = line.match(commonDate);
    const amountMatch = line.match(amountPattern);
    if (!dateMatch || !amountMatch) continue;

    const date = new Date(dateMatch[1].replace(/-/g, '/'));
    if (!date.getTime()) continue;

    const amount = normalizeAmount(amountMatch[1]);
    if (!amount) continue;

    const description = line
      .replace(dateMatch[0], '')
      .replace(amountMatch[0], '')
      .replace(/cr|dr/gi, '')
      .trim()
      .replace(/\s{2,}/g, ' ')
      .replace(/[-|•]/g, ' ')
      .trim();

    if (!description) continue;
    matches.push({ description, amount, date: date.toISOString() });
  }

  return matches.slice(0, 50);
}

function buildLocalAnalysis(expenses) {
  const now = new Date();
  const thisMonth = expenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });

  const impulseSpending = thisMonth.filter((expense) => /food|shopping|entertainment/.test(expense.category)).reduce((sum, expense) => sum + expense.amount, 0);
  const byCategory = {};
  thisMonth.forEach((expense) => {
    byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
  });
  const insights = Object.entries(byCategory).map(([category, value]) => ({
    category,
    intent: /food|shopping|entertainment/.test(category) ? 'Impulse' : 'Planned',
    risk: value > 300 ? 'High' : 'Medium',
    habitLikelihood: Math.min(1, Number(value) / 1000),
    reasoning: value > 300 ? 'High monthly spend' : 'Stable monthly behavior',
  }));
  const suggestions = Object.keys(byCategory).slice(0, 3).map((category) => `Review your ${category} spending to identify recurring costs and save more.`);

  return {
    insights,
    suggestions,
    shortExplanations: suggestions,
    metrics: {
      impulseSpending,
      badHabitCount: insights.filter((entry) => entry.risk !== 'Low').length,
      potentialSavings: Math.max(0, Math.round(impulseSpending * 0.18)),
    },
  };
}

function buildChatSummary(expenses) {
  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const categoryTotals = expenses.reduce((totals, expense) => {
    const category = expense.category || 'other';
    totals[category] = (totals[category] || 0) + Number(expense.amount || 0);
    return totals;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount]) => ({ category, amount: Number(amount.toFixed(0)) }));

  const note = expenses.length > 0
    ? `You have ${expenses.length} transactions totaling ₹${totalSpent.toFixed(0)}. Your top categories are ${topCategories.map((item) => item.category).join(', ')}.`
    : 'No expense records are available yet. Ask me anything once you have uploaded your expenses.';

  return {
    totalSpent: Number(totalSpent.toFixed(0)),
    transactionCount: expenses.length,
    topCategories,
    note,
  };
}

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const expenses = Array.isArray(req.body.expenses) ? req.body.expenses : [];
    if (!openai) {
      return res.json(buildLocalAnalysis(expenses));
    }
    const prompt = `You are a secure financial assistant. Analyze the following user expenses and return only valid JSON with keys: insights (array of { category, intent, risk, habitLikelihood, reasoning }), suggestions (array of strings), shortExplanations (array of strings), metrics ({ impulseSpending, badHabitCount, potentialSavings }). Expenses: ${JSON.stringify(expenses)}.`;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.25,
    });
    const output = response.choices?.[0]?.message?.content || '';
    const raw = output.trim();
    const json = JSON.parse(raw.replace(/^[^\{\[]+/, '').replace(/[^\}\]]+$/, ''));
    return res.json(json);
  } catch (error) {
    console.error('AI analyze failed:', error?.message || error);
    return res.json(buildLocalAnalysis(req.body.expenses || []));
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { expenses = [], message } = req.body;
    const analysis = buildChatSummary(expenses);

    if (!openai) {
      const fallback = `I can't reach the AI service now, but here's a quick tip: focus on your top expense categories and cut one recurring subscription.`;
      return res.json({ reply: fallback, analysis });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const systemPrompt = `You are ExpenseAI, a conversational expense-tracker assistant. Use the given expense data to answer the user's query with direct, specific advice. Mention relevant spending patterns, top categories, and savings ideas when helpful.`;
    const userPrompt = `Expenses: ${JSON.stringify(expenses)}\n\nUser asks: ${String(message)}`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.72,
      top_p: 0.95,
      max_tokens: 300,
    });
    const reply = response.choices?.[0]?.message?.content || '';
    return res.json({ reply: reply.trim(), analysis });
  } catch (error) {
    console.error('AI chat failed:', error?.message || error);
    const analysis = buildChatSummary(req.body.expenses || []);
    return res.status(500).json({ reply: 'Unable to reach the AI assistant. Please try again later.', analysis });
  }
});

app.post('/api/statement/parse', upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided.' });
    }

    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    let transactions = [];
    let source = 'unknown';

    if (mimeType === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      source = 'pdf';
      const data = await pdfParse(fileBuffer);
      transactions = extractTransactionsFromText(data.text || '');
    } else if (mimeType.includes('csv') || req.file.originalname.toLowerCase().endsWith('.csv') || req.body.contentType === 'csv') {
      source = 'csv';
      const text = fileBuffer.toString('utf-8');
      transactions = parseCsvRows(text);
    } else {
      const text = fileBuffer.toString('utf-8');
      transactions = extractTransactionsFromText(text);
      source = 'text';
    }

    if (transactions.length === 0) {
      return res.status(200).json({
        source,
        transactions: [],
        errors: ['Could not extract any transactions from the uploaded file. Please use a bank statement or CSV export.'],
      });
    }

    const augmented = await Promise.all(transactions.slice(0, 100).map(async (transaction) => {
      const category = inferCategoryFromDescription(transaction.description) || 'other';
      const finalCategory = category !== 'other' ? category : await classifyWithAI(transaction.description);
      return {
        ...transaction,
        category: finalCategory,
        source: source === 'csv' ? 'CSV' : 'PDF',
      };
    }));

    return res.json({ source, transactions: augmented });
  } catch (error) {
    console.error('Statement parse failed:', error?.message || error);
    return res.status(500).json({ error: 'Failed to parse uploaded statement.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', openai: Boolean(openai) });
});

app.listen(PORT, () => {
  console.log(`ExpenseAI server listening on http://localhost:${PORT}`);
});
