import { getStructuredModel } from '../ai/gemini-client';
import { getFileCategory } from './file-utils';

export interface ExtractedFinancialData {
  date: string;
  vendor: string;
  amount: number;
  description: string;
  category: string;
  accountCode?: string;
  items?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
  }>;
  confidence: number;
  documentType: 'invoice' | 'receipt' | 'bank_statement' | 'expense_report' | 'other';
  rawText?: string;
}

/**
 * Extract financial data from document using Gemini Vision
 */
export async function extractFinancialData(
  fileBase64: string,
  mimeType: string,
  fileName: string
): Promise<ExtractedFinancialData> {
  const model = getStructuredModel();
  const fileCategory = getFileCategory(mimeType);

  // Build prompt for financial data extraction
  const prompt = buildExtractionPrompt(fileName, fileCategory);

  try {
    // Prepare content based on file type
    const parts: any[] = [
      {
        text: prompt,
      },
    ];

    // Add image/document data
    if (fileCategory === 'image' || fileCategory === 'pdf') {
      parts.push({
        inlineData: {
          mimeType,
          data: fileBase64,
        },
      });
    }

    // Call Gemini Vision API
    const result = await model.generateContent(parts);
    const response = result.response;
    const text = response.text().trim();

    // Parse JSON response
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const extracted = JSON.parse(jsonText);

    // Validate and format extracted data
    return validateExtractedData(extracted);
  } catch (error) {
    console.error('Error extracting financial data:', error);

    // Return minimal data with low confidence
    return {
      date: new Date().toISOString().split('T')[0],
      vendor: 'Unknown',
      amount: 0,
      description: `Failed to extract from ${fileName}`,
      category: 'Uncategorized',
      confidence: 0,
      documentType: 'other',
    };
  }
}

/**
 * Build extraction prompt based on document type
 */
function buildExtractionPrompt(fileName: string, fileCategory: string): string {
  return `You are a financial document analyzer. Extract financial data from this ${fileCategory} document.

Analyze this document and extract the following information:
1. **Date**: Transaction or document date (YYYY-MM-DD format)
2. **Vendor/Supplier**: Company or person name
3. **Amount**: Total amount (numeric value only, no currency symbols)
4. **Description**: Brief description of transaction
5. **Category**: Best matching category from: Revenue, Cost of Goods Sold, Rent, Utilities, Payroll, Office Expenses, Marketing, Insurance, Professional Services, Equipment, Travel, Entertainment, Technology, or Other
6. **Document Type**: invoice, receipt, bank_statement, expense_report, or other
7. **Line Items**: Individual items if itemized (description, quantity, unit price, amount)
8. **Confidence**: Your confidence in the extraction (0.0 to 1.0)

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "date": "2024-01-15",
  "vendor": "Acme Corporation",
  "amount": 1250.00,
  "description": "Office supplies and equipment",
  "category": "Office Expenses",
  "accountCode": "6100",
  "documentType": "invoice",
  "items": [
    {
      "description": "Printer paper (500 sheets)",
      "quantity": 10,
      "unitPrice": 25.00,
      "amount": 250.00
    }
  ],
  "confidence": 0.95
}

Important rules:
- Extract ACTUAL values from the document, don't make up data
- Use numeric values without currency symbols for amounts
- Date must be in YYYY-MM-DD format
- If you can't find a value, use reasonable defaults
- Confidence should reflect how certain you are about the extraction
- Category must be one of the predefined categories listed above

File name: ${fileName}

Now analyze the document and return the JSON:`;
}

/**
 * Validate and normalize extracted data
 */
function validateExtractedData(data: any): ExtractedFinancialData {
  // Ensure required fields exist
  const validated: ExtractedFinancialData = {
    date: data.date || new Date().toISOString().split('T')[0],
    vendor: data.vendor || 'Unknown Vendor',
    amount: parseFloat(data.amount) || 0,
    description: data.description || 'No description',
    category: data.category || 'Uncategorized',
    accountCode: data.accountCode,
    confidence: parseFloat(data.confidence) || 0.5,
    documentType: data.documentType || 'other',
  };

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(validated.date)) {
    validated.date = new Date().toISOString().split('T')[0];
    validated.confidence = Math.max(0, validated.confidence - 0.1);
  }

  // Validate amount
  if (isNaN(validated.amount) || validated.amount < 0) {
    validated.amount = 0;
    validated.confidence = Math.max(0, validated.confidence - 0.2);
  }

  // Validate and parse line items
  if (data.items && Array.isArray(data.items)) {
    validated.items = data.items.map((item: any) => ({
      description: item.description || 'Item',
      quantity: parseFloat(item.quantity) || undefined,
      unitPrice: parseFloat(item.unitPrice) || undefined,
      amount: parseFloat(item.amount) || 0,
    }));
  }

  return validated;
}

/**
 * Generate journal entries from extracted data
 */
export function generateJournalEntries(extracted: ExtractedFinancialData): Array<{
  date: string;
  vendor: string;
  description: string;
  amount: number;
  account: string;
}> {
  const entries: Array<{
    date: string;
    vendor: string;
    description: string;
    amount: number;
    account: string;
  }> = [];

  // If we have line items, create entries for each
  if (extracted.items && extracted.items.length > 0) {
    extracted.items.forEach((item) => {
      entries.push({
        date: extracted.date,
        vendor: extracted.vendor,
        description: item.description,
        amount: item.amount,
        account: extracted.category,
      });
    });
  } else {
    // Single entry for the entire document
    entries.push({
      date: extracted.date,
      vendor: extracted.vendor,
      description: extracted.description,
      amount: extracted.amount,
      account: extracted.category,
    });
  }

  return entries;
}

/**
 * Batch process multiple documents
 */
export async function batchExtractDocuments(
  files: Array<{
    base64: string;
    mimeType: string;
    fileName: string;
  }>
): Promise<ExtractedFinancialData[]> {
  const results: ExtractedFinancialData[] = [];

  // Process files sequentially to avoid rate limits
  for (const file of files) {
    try {
      const extracted = await extractFinancialData(file.base64, file.mimeType, file.fileName);
      results.push(extracted);

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error processing ${file.fileName}:`, error);
      results.push({
        date: new Date().toISOString().split('T')[0],
        vendor: 'Unknown',
        amount: 0,
        description: `Error processing ${file.fileName}`,
        category: 'Uncategorized',
        confidence: 0,
        documentType: 'other',
      });
    }
  }

  return results;
}

/**
 * Check if extracted data needs admin review
 */
export function needsAdminReview(extracted: ExtractedFinancialData): {
  needsReview: boolean;
  reason?: string;
} {
  // Low confidence
  if (extracted.confidence < 0.7) {
    return { needsReview: true, reason: `Low confidence (${(extracted.confidence * 100).toFixed(0)}%)` };
  }

  // Large amount
  if (extracted.amount > 5000) {
    return { needsReview: true, reason: 'Large amount requires review' };
  }

  // Missing critical data
  if (!extracted.vendor || extracted.vendor === 'Unknown Vendor') {
    return { needsReview: true, reason: 'Vendor information missing' };
  }

  if (extracted.category === 'Uncategorized' || extracted.category === 'Other') {
    return { needsReview: true, reason: 'Unable to categorize transaction' };
  }

  return { needsReview: false };
}
