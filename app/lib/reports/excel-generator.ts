import ExcelJS from 'exceljs';
import {
  generateProfitLossData,
  generateExpenseReportData,
  formatCurrency,
  formatPercentage,
  formatReportDate,
  generateReportFileName,
  type ProfitLossData,
  type ExpenseReport,
} from './report-utils';

/**
 * Generate Profit & Loss Excel report
 */
export async function generateProfitLossExcel(
  companyId: string,
  fiscalYear: number,
  companyName: string
): Promise<Buffer> {
  // Get data
  const data = await generateProfitLossData(companyId, fiscalYear, companyName);

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AI Accounting Assistant';
  workbook.created = new Date();

  // Add worksheet
  const worksheet = workbook.addWorksheet('Profit & Loss Statement', {
    pageSetup: { paperSize: 9, orientation: 'portrait' },
  });

  // Set column widths
  worksheet.columns = [
    { width: 30 }, // Description
    { width: 15 }, // Amount
    { width: 10 }, // Percentage
  ];

  let rowIndex = 1;

  // Header Section
  const titleRow = worksheet.getRow(rowIndex++);
  titleRow.getCell(1).value = data.companyName;
  titleRow.getCell(1).font = { size: 16, bold: true };
  rowIndex++;

  const subtitleRow = worksheet.getRow(rowIndex++);
  subtitleRow.getCell(1).value = `Profit & Loss Statement - ${data.fiscalYear}`;
  subtitleRow.getCell(1).font = { size: 14, bold: true };
  rowIndex++;

  const dateRow = worksheet.getRow(rowIndex++);
  dateRow.getCell(1).value = `Generated: ${formatReportDate(data.generatedDate)}`;
  dateRow.getCell(1).font = { size: 10, italic: true };
  rowIndex++;

  // Revenue Section
  rowIndex++;
  const revenueHeaderRow = worksheet.getRow(rowIndex++);
  revenueHeaderRow.getCell(1).value = 'REVENUE';
  revenueHeaderRow.getCell(1).font = { size: 12, bold: true };
  revenueHeaderRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  worksheet.mergeCells(rowIndex - 1, 1, rowIndex - 1, 3);

  // Revenue items
  data.revenue.items.forEach((item) => {
    const row = worksheet.getRow(rowIndex++);
    row.getCell(1).value = item.category;
    row.getCell(2).value = item.amount;
    row.getCell(2).numFmt = '$#,##0';
    row.getCell(3).value = item.percentage / 100;
    row.getCell(3).numFmt = '0.0%';

    // Add subcategories if present
    if (item.subcategories) {
      item.subcategories.forEach((sub) => {
        const subRow = worksheet.getRow(rowIndex++);
        subRow.getCell(1).value = `  • ${sub.name}`;
        subRow.getCell(1).font = { italic: true };
        subRow.getCell(2).value = sub.amount;
        subRow.getCell(2).numFmt = '$#,##0';
        subRow.getCell(2).font = { italic: true };
      });
    }
  });

  // Total Revenue
  const totalRevenueRow = worksheet.getRow(rowIndex++);
  totalRevenueRow.getCell(1).value = 'Total Revenue';
  totalRevenueRow.getCell(1).font = { bold: true };
  totalRevenueRow.getCell(2).value = data.revenue.total;
  totalRevenueRow.getCell(2).numFmt = '$#,##0';
  totalRevenueRow.getCell(2).font = { bold: true };
  totalRevenueRow.getCell(2).border = {
    top: { style: 'thin' },
    bottom: { style: 'double' },
  };
  rowIndex++;

  // Expenses Section
  rowIndex++;
  const expensesHeaderRow = worksheet.getRow(rowIndex++);
  expensesHeaderRow.getCell(1).value = 'EXPENSES';
  expensesHeaderRow.getCell(1).font = { size: 12, bold: true };
  expensesHeaderRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  worksheet.mergeCells(rowIndex - 1, 1, rowIndex - 1, 3);

  // Expense items
  data.expenses.items.forEach((item) => {
    const row = worksheet.getRow(rowIndex++);
    row.getCell(1).value = item.category;
    row.getCell(2).value = item.amount;
    row.getCell(2).numFmt = '$#,##0';
    row.getCell(3).value = item.percentage / 100;
    row.getCell(3).numFmt = '0.0%';

    // Add subcategories if present
    if (item.subcategories) {
      item.subcategories.forEach((sub) => {
        const subRow = worksheet.getRow(rowIndex++);
        subRow.getCell(1).value = `  • ${sub.name}`;
        subRow.getCell(1).font = { italic: true };
        subRow.getCell(2).value = sub.amount;
        subRow.getCell(2).numFmt = '$#,##0';
        subRow.getCell(2).font = { italic: true };
      });
    }
  });

  // Total Expenses
  const totalExpensesRow = worksheet.getRow(rowIndex++);
  totalExpensesRow.getCell(1).value = 'Total Expenses';
  totalExpensesRow.getCell(1).font = { bold: true };
  totalExpensesRow.getCell(2).value = data.expenses.total;
  totalExpensesRow.getCell(2).numFmt = '$#,##0';
  totalExpensesRow.getCell(2).font = { bold: true };
  totalExpensesRow.getCell(2).border = {
    top: { style: 'thin' },
    bottom: { style: 'double' },
  };
  rowIndex++;

  // Net Profit Section
  rowIndex++;
  const netProfitRow = worksheet.getRow(rowIndex++);
  netProfitRow.getCell(1).value = 'NET PROFIT';
  netProfitRow.getCell(1).font = { size: 14, bold: true };
  netProfitRow.getCell(2).value = data.netProfit;
  netProfitRow.getCell(2).numFmt = '$#,##0';
  netProfitRow.getCell(2).font = { size: 14, bold: true };
  netProfitRow.getCell(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: data.netProfit >= 0 ? 'FF90EE90' : 'FFFF6B6B' },
  };
  netProfitRow.getCell(2).border = {
    top: { style: 'double' },
    bottom: { style: 'double' },
  };

  // Profit Margin
  const marginRow = worksheet.getRow(rowIndex++);
  marginRow.getCell(1).value = 'Profit Margin';
  marginRow.getCell(1).font = { bold: true };
  marginRow.getCell(2).value = data.profitMargin / 100;
  marginRow.getCell(2).numFmt = '0.0%';
  marginRow.getCell(2).font = { bold: true };

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate Expense Report Excel
 */
export async function generateExpenseReportExcel(
  companyId: string,
  fiscalYear: number,
  companyName: string,
  fiscalQuarter?: number
): Promise<Buffer> {
  // Get data
  const data = await generateExpenseReportData(companyId, fiscalYear, companyName, fiscalQuarter);

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AI Accounting Assistant';
  workbook.created = new Date();

  // Add worksheet
  const worksheet = workbook.addWorksheet('Expense Report', {
    pageSetup: { paperSize: 9, orientation: 'portrait' },
  });

  // Set column widths
  worksheet.columns = [
    { width: 30 }, // Description
    { width: 15 }, // Amount
    { width: 10 }, // Percentage
  ];

  let rowIndex = 1;

  // Header
  const titleRow = worksheet.getRow(rowIndex++);
  titleRow.getCell(1).value = data.companyName;
  titleRow.getCell(1).font = { size: 16, bold: true };
  rowIndex++;

  const subtitleRow = worksheet.getRow(rowIndex++);
  subtitleRow.getCell(1).value = `Expense Report - ${data.fiscalYear}${
    data.fiscalQuarter ? ` Q${data.fiscalQuarter}` : ''
  }`;
  subtitleRow.getCell(1).font = { size: 14, bold: true };
  rowIndex++;

  const dateRow = worksheet.getRow(rowIndex++);
  dateRow.getCell(1).value = `Generated: ${formatReportDate(data.generatedDate)}`;
  dateRow.getCell(1).font = { size: 10, italic: true };
  rowIndex++;

  // Expenses by Category
  rowIndex++;
  const categoryHeaderRow = worksheet.getRow(rowIndex++);
  categoryHeaderRow.getCell(1).value = 'EXPENSES BY CATEGORY';
  categoryHeaderRow.getCell(1).font = { size: 12, bold: true };
  categoryHeaderRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  worksheet.mergeCells(rowIndex - 1, 1, rowIndex - 1, 3);

  // Category breakdown
  data.expensesByCategory.forEach((item) => {
    const row = worksheet.getRow(rowIndex++);
    row.getCell(1).value = item.category;
    row.getCell(2).value = item.amount;
    row.getCell(2).numFmt = '$#,##0';
    row.getCell(3).value = item.percentage / 100;
    row.getCell(3).numFmt = '0.0%';

    if (item.subcategories) {
      item.subcategories.forEach((sub) => {
        const subRow = worksheet.getRow(rowIndex++);
        subRow.getCell(1).value = `  • ${sub.name}`;
        subRow.getCell(1).font = { italic: true };
        subRow.getCell(2).value = sub.amount;
        subRow.getCell(2).numFmt = '$#,##0';
        subRow.getCell(2).font = { italic: true };
      });
    }
  });

  // Total
  const totalRow = worksheet.getRow(rowIndex++);
  totalRow.getCell(1).value = 'Total Expenses';
  totalRow.getCell(1).font = { bold: true };
  totalRow.getCell(2).value = data.totalExpenses;
  totalRow.getCell(2).numFmt = '$#,##0';
  totalRow.getCell(2).font = { bold: true };
  totalRow.getCell(2).border = {
    top: { style: 'thin' },
    bottom: { style: 'double' },
  };
  rowIndex += 2;

  // Top Expenses
  const topExpensesHeaderRow = worksheet.getRow(rowIndex++);
  topExpensesHeaderRow.getCell(1).value = 'TOP 10 INDIVIDUAL EXPENSES';
  topExpensesHeaderRow.getCell(1).font = { size: 12, bold: true };
  topExpensesHeaderRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  worksheet.mergeCells(rowIndex - 1, 1, rowIndex - 1, 3);

  // Column headers
  const topExpenseHeaderRow = worksheet.getRow(rowIndex++);
  topExpenseHeaderRow.getCell(1).value = 'Description';
  topExpenseHeaderRow.getCell(2).value = 'Amount';
  topExpenseHeaderRow.getCell(3).value = 'Date';
  topExpenseHeaderRow.font = { bold: true };
  topExpenseHeaderRow.border = {
    bottom: { style: 'thin' },
  };

  // Top expenses list
  data.topExpenses.forEach((expense) => {
    const row = worksheet.getRow(rowIndex++);
    row.getCell(1).value = expense.description;
    row.getCell(2).value = expense.amount;
    row.getCell(2).numFmt = '$#,##0';
    row.getCell(3).value = formatReportDate(expense.date);
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate Journal Entries Excel (for document processing)
 */
export async function generateJournalEntriesExcel(
  entries: Array<{
    date: string;
    vendor: string;
    description: string;
    amount: number;
    account: string;
  }>,
  documentName: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AI Accounting Assistant';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Journal Entries');

  // Set column widths
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Vendor/Customer', key: 'vendor', width: 25 },
    { header: 'Description', key: 'description', width: 35 },
    { header: 'Account', key: 'account', width: 20 },
    { header: 'Debit', key: 'debit', width: 15 },
    { header: 'Credit', key: 'credit', width: 15 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add entries
  entries.forEach((entry) => {
    worksheet.addRow({
      date: entry.date,
      vendor: entry.vendor,
      description: entry.description,
      account: entry.account,
      debit: entry.amount > 0 ? entry.amount : null,
      credit: entry.amount < 0 ? Math.abs(entry.amount) : null,
    });
  });

  // Format currency columns
  worksheet.getColumn('debit').numFmt = '$#,##0.00';
  worksheet.getColumn('credit').numFmt = '$#,##0.00';

  // Add totals row
  const lastRow = worksheet.lastRow?.number || 1;
  const totalRow = worksheet.getRow(lastRow + 2);
  totalRow.getCell(4).value = 'TOTALS:';
  totalRow.getCell(4).font = { bold: true };
  totalRow.getCell(5).value = {
    formula: `SUM(E2:E${lastRow + 1})`,
  };
  totalRow.getCell(6).value = {
    formula: `SUM(F2:F${lastRow + 1})`,
  };
  totalRow.font = { bold: true };
  totalRow.border = {
    top: { style: 'double' },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
