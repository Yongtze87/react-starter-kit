import type { ActionFunctionArgs } from 'react-router';
import { getCurrentUserProfile, getCompanyById } from '~/lib/supabase';
import {
  generateProfitLossExcel,
  generateProfitLossPDF,
  generateExpenseReportExcel,
  generateExpenseReportPDF,
  generateReportFileName,
} from '~/lib/reports';

/**
 * Report Generation API endpoint
 * POST /api/reports
 * Body: {
 *   reportType: 'profit_loss' | 'expense_report',
 *   format: 'excel' | 'pdf',
 *   fiscalYear: number,
 *   fiscalQuarter?: number
 * }
 */
export async function action({ request }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get current user
    const userProfile = await getCurrentUserProfile();

    if (!userProfile || !userProfile.profile) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await request.json();
    const { reportType, format, fiscalYear, fiscalQuarter } = body;

    // Validate input
    if (!reportType || !['profit_loss', 'expense_report'].includes(reportType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid report type. Must be profit_loss or expense_report' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!format || !['excel', 'pdf'].includes(format)) {
      return new Response(
        JSON.stringify({ error: 'Invalid format. Must be excel or pdf' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!fiscalYear || typeof fiscalYear !== 'number') {
      return new Response(JSON.stringify({ error: 'Invalid fiscal year' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get company info
    const company = await getCompanyById(userProfile.profile.company_id);

    if (!company) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate report
    let buffer: Buffer;
    let mimeType: string;
    let fileExtension: 'xlsx' | 'pdf';

    if (reportType === 'profit_loss') {
      if (format === 'excel') {
        buffer = await generateProfitLossExcel(
          userProfile.profile.company_id,
          fiscalYear,
          company.name
        );
        mimeType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
      } else {
        buffer = await generateProfitLossPDF(
          userProfile.profile.company_id,
          fiscalYear,
          company.name
        );
        mimeType = 'application/pdf';
        fileExtension = 'pdf';
      }
    } else {
      // expense_report
      if (format === 'excel') {
        buffer = await generateExpenseReportExcel(
          userProfile.profile.company_id,
          fiscalYear,
          company.name,
          fiscalQuarter
        );
        mimeType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
      } else {
        buffer = await generateExpenseReportPDF(
          userProfile.profile.company_id,
          fiscalYear,
          company.name,
          fiscalQuarter
        );
        mimeType = 'application/pdf';
        fileExtension = 'pdf';
      }
    }

    // Generate filename
    const fileName = generateReportFileName(
      reportType,
      company.name,
      fiscalYear,
      fileExtension
    );

    // Return file
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// GET handler - returns supported report types
export async function loader() {
  return new Response(
    JSON.stringify({
      supportedReportTypes: ['profit_loss', 'expense_report'],
      supportedFormats: ['excel', 'pdf'],
      usage: {
        method: 'POST',
        endpoint: '/api/reports',
        body: {
          reportType: 'profit_loss | expense_report',
          format: 'excel | pdf',
          fiscalYear: 'number',
          fiscalQuarter: 'number (optional, for expense_report)',
        },
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
