export interface ParsedTransaction {
  description: string;
  amount: number;
  date: string;
  category: string;
  source: 'PDF' | 'CSV' | 'OCR' | 'MANUAL' | string;
}

export interface StatementParseResult {
  source: string;
  transactions: ParsedTransaction[];
  errors?: string[];
}

/**
 * Parse CSV bank statement file
 * Supports multiple formats - auto-detects columns by header
 * Expected columns: Date/Transaction Date/Posted Date, Description/Merchant/Narration, Amount/Debit/Credit, etc.
 */
function detectCSVDelimiter(headerLine: string): string {
  const candidates = [',', ';', '\t', '|'];
  const counts = candidates.map((delimiter) => ({
    delimiter,
    count: headerLine.split(delimiter).length,
  }));
  counts.sort((a, b) => b.count - a.count);
  return counts[0].count > 1 ? counts[0].delimiter : ',';
}

function splitCSVRow(row: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim().replace(/^"(.*)"$/, '$1'));
}

function parseDateString(dateStr: string): string | null {
  const value = dateStr.trim();
  if (!value) return null;

  const tryDate = (input: string) => {
    const result = new Date(input);
    return !isNaN(result.getTime()) ? result : null;
  };

  let parsed = tryDate(value);
  if (parsed) return parsed.toISOString().split('T')[0];

  const dmy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    let year = parseInt(dmy[3], 10);
    if (year < 100) year += 2000;
    parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }

  const namedMonth = value.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})$/);
  if (namedMonth) {
    const day = parseInt(namedMonth[1], 10);
    const monthName = namedMonth[2].toLowerCase();
    const year = parseInt(namedMonth[3], 10);
    const month = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    ].findIndex((m) => monthName.startsWith(m));
    if (month >= 0) {
      parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    }
  }

  const namedMonthSuffix = value.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{2,4})$/);
  if (namedMonthSuffix) {
    const monthName = namedMonthSuffix[1].toLowerCase();
    const day = parseInt(namedMonthSuffix[2], 10);
    const year = parseInt(namedMonthSuffix[3], 10);
    const month = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    ].findIndex((m) => monthName.startsWith(m));
    if (month >= 0) {
      parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    }
  }

  return null;
}

function parseAmountString(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/\s+/g, '')
    .replace(/[₹$€£,]/g, '')
    .replace(/CR|Dr|DR|cr|debit|credit/gi, '');

  const negative = /\(|\-|−/.test(raw);
  const value = parseFloat(cleaned);
  if (isNaN(value)) return null;
  return negative ? -Math.abs(value) : value;
}

async function parseCSVStatement(file: File): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          reject(new Error('CSV file appears to be empty. Expected header + at least 1 transaction.'));
          return;
        }

        const delimiter = detectCSVDelimiter(lines[0]);
        const headers = splitCSVRow(lines[0], delimiter).map((h) => h.trim().toLowerCase());

        const dateIdx = headers.findIndex((h) => /date|transaction|posted/i.test(h));
        const descIdx = headers.findIndex((h) => /description|merchant|narration|details|reference/i.test(h));
        const amountIdx = headers.findIndex((h) => /amount|value|balance/i.test(h));
        const debitIdx = headers.findIndex((h) => /debit|withdrawn|payment|paid/i.test(h));
        const creditIdx = headers.findIndex((h) => /credit|deposited|received|refund/i.test(h));

        if (dateIdx === -1 || descIdx === -1 || (amountIdx === -1 && debitIdx === -1 && creditIdx === -1)) {
          reject(new Error(
            `Could not detect required columns in CSV.\n\n` +
            `Required columns:\n` +
            `• Date (Date, Transaction Date, Posted Date)\n` +
            `• Description (Description, Merchant, Narration, Details)\n` +
            `• Amount or Debit/Credit columns\n\n` +
            `Example CSV format:\n` +
            `Date,Description,Amount\n` +
            `2024-01-15,Grocery Store,150.50\n` +
            `2024-01-16,Uber Ride,45.00`
          ));
          return;
        }

        const transactions: ParsedTransaction[] = [];

        lines.slice(1).forEach((line, lineNum) => {
          const cells = splitCSVRow(line, delimiter);
          if (cells.length < 2) return;

          const rawDate = dateIdx >= 0 ? cells[dateIdx] : '';
          const rawDesc = descIdx >= 0 ? cells[descIdx] : '';
          const rawAmount = amountIdx >= 0 ? cells[amountIdx] : '';
          const rawDebit = debitIdx >= 0 ? cells[debitIdx] : '';
          const rawCredit = creditIdx >= 0 ? cells[creditIdx] : '';

          const dateFormatted = parseDateString(rawDate);
          const amountValue = parseAmountString(rawAmount) ?? parseAmountString(rawDebit) ?? parseAmountString(rawCredit);

          let description = rawDesc.trim();
          if (!description) {
            description = cells
              .filter((_, idx) => idx !== dateIdx && idx !== amountIdx && idx !== debitIdx && idx !== creditIdx)
              .map((cell) => cell.trim())
              .filter(Boolean)
              .join(' ');
          }

          if (!dateFormatted || amountValue === null || !description) {
            return;
          }

          transactions.push({
            description,
            amount: Math.abs(amountValue),
            date: dateFormatted,
            category: categorizeTransaction(description),
            source: 'CSV',
          });
        });

        if (transactions.length === 0) {
          reject(new Error(
            'No valid transactions found in CSV.\n\n' +
            'Make sure your CSV has:\n' +
            '• A header row with Date, Description, and Amount columns\n' +
            '• At least one transaction row\n' +
            '• Valid dates and amounts in each row'
          ));
          return;
        }

        resolve(transactions);
      } catch (err) {
        reject(new Error('Failed to parse CSV: ' + (err instanceof Error ? err.message : 'Unknown error')));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

/**
 * Auto-categorize transactions based on description keywords
 */
function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  const categoryMap: { [key: string]: string[] } = {
    'Food': ['grocery', 'restaurant', 'cafe', 'pizza', 'burger', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'mcdonalds', 'kfc', 'starbucks', 'swiggy', 'zomato'],
    'Transport': ['uber', 'taxi', 'fuel', 'gas', 'petrol', 'toll', 'metro', 'train', 'bus', 'autorickshaw', 'parking'],
    'Utilities': ['electricity', 'water', 'internet', 'phone', 'mobile', 'broadband', 'wifi'],
    'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'entertainment', 'concert', 'show'],
    'Shopping': ['amazon', 'flipkart', 'shop', 'mall', 'store', 'clothing', 'dress', 'fashion', 'clothes'],
    'Health': ['medical', 'doctor', 'hospital', 'pharmacy', 'medicine', 'health', 'clinic', 'dental', 'gym'],
    'Travel': ['hotel', 'flight', 'booking', 'airbnb', 'resort', 'travel', 'vacation'],
  };
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}

/**
 * Parse bank statement file (CSV, PDF text export, or OCR)
 */
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function parsePDFStatement(file: File): Promise<ParsedTransaction[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const dateRegex = /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})/;
  const amountRegex = /(\(?[₹$€£]?\s*-?\d{1,3}(?:[\d,]*\d)?(?:\.\d{1,2})?\)?)/g;

  const transactions: ParsedTransaction[] = [];
  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    const amountMatches = Array.from(line.matchAll(amountRegex)).map((m) => m[0]).filter(Boolean);
    if (!dateMatch || amountMatches.length === 0) continue;

    const rawAmount = amountMatches[amountMatches.length - 1];
    const rawDate = dateMatch[0];
    const parsedDate = parseDateString(rawDate);
    const amountValue = parseAmountString(rawAmount);
    if (!parsedDate || amountValue === null) continue;

    let description = line
      .replace(rawDate, '')
      .replace(rawAmount, '')
      .replace(/\b(cr|dr|debit|credit)\b/gi, '')
      .replace(/[()₹$€£]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!description || description.length < 3) {
      description = line.replace(rawDate, '').replace(rawAmount, '').trim();
    }

    if (!description || description.length < 3) continue;

    transactions.push({
      description,
      amount: Math.abs(amountValue),
      date: parsedDate,
      category: categorizeTransaction(description),
      source: 'PDF',
    });
  }

  return transactions;
}
export async function parseBankStatement(file: File): Promise<StatementParseResult> {
  try {
    let transactions: ParsedTransaction[] = [];
    let sourceType = 'Unknown';
    if (file.name.toLowerCase().endsWith('.csv')) {
      transactions = await parseCSVStatement(file);
      sourceType = 'CSV';
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      transactions = await parsePDFStatement(file);
      sourceType = 'PDF';
    } else {
      throw new Error('Only CSV and PDF files are supported. Please upload a CSV or PDF export from your bank.');
    }
    return {
      source: file.name,
      transactions,
      errors: transactions.length === 0 ? ['No transactions found'] : undefined,
    };
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : 'Unable to parse bank statement. Make sure it\'s a CSV or PDF file with Date, Description, and Amount columns.'
    );
  }
}

