import type { ActionFunctionArgs } from 'react-router';
import { getCurrentUserProfile, getCompanyById } from '~/lib/supabase';
import { uploadDocument } from '~/lib/supabase/queries';
import { createServerSupabaseClient } from '~/lib/supabase/client';
import {
  validateFile,
  generateUniqueFileName,
  fileToBase64,
  supportsVisionExtraction,
  MAX_FILE_SIZE_BYTES,
} from '~/lib/documents/file-utils';
import {
  extractFinancialData,
  generateJournalEntries,
  needsAdminReview,
} from '~/lib/documents/document-extractor';
import { generateJournalEntriesExcel } from '~/lib/reports';

/**
 * Document Upload API endpoint
 * POST /api/documents/upload
 * Content-Type: multipart/form-data
 * Body: FormData with 'file' field
 */
export async function action({ request }: ActionFunctionArgs) {
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

    const userId = userProfile.profile.id;
    const companyId = userProfile.profile.company_id;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { fileInfo } = validation;

    // Get company info
    const company = await getCompanyById(companyId);
    if (!company) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate unique file name
    const uniqueFileName = generateUniqueFileName(file.name, companyId);

    // Upload to Supabase Storage
    const supabaseServer = createServerSupabaseClient();
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('documents')
      .upload(uniqueFileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage', details: uploadError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabaseServer.storage
      .from('documents')
      .getPublicUrl(uniqueFileName);

    const fileUrl = urlData.publicUrl;

    // Extract financial data using Gemini Vision (if supported)
    let extractedData = null;
    let journalEntriesUrl = null;
    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';

    if (supportsVisionExtraction(file.type)) {
      try {
        // Convert file to base64
        const base64Data = await fileToBase64(file);

        // Extract data
        extractedData = await extractFinancialData(base64Data, file.type, file.name);

        // Generate journal entries
        const entries = generateJournalEntries(extractedData);

        // Create Excel file with journal entries
        const excelBuffer = await generateJournalEntriesExcel(entries, file.name);

        // Upload journal entries Excel to storage
        const entriesFileName = `journal_entries/${companyId}/${Date.now()}_entries.xlsx`;
        const { data: entriesUpload, error: entriesError } = await supabaseServer.storage
          .from('documents')
          .upload(entriesFileName, excelBuffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upsert: false,
          });

        if (!entriesError) {
          const { data: entriesUrlData } = supabaseServer.storage
            .from('documents')
            .getPublicUrl(entriesFileName);
          journalEntriesUrl = entriesUrlData.publicUrl;
        }

        // Check if needs admin review
        const reviewCheck = needsAdminReview(extractedData);
        status = reviewCheck.needsReview ? 'pending' : 'processing';
      } catch (extractError) {
        console.error('Error extracting document data:', extractError);
        status = 'failed';
      }
    }

    // Create document record in database
    const documentRecord = await uploadDocument({
      company_id: companyId,
      uploaded_by: userId,
      document_name: file.name,
      document_type: fileInfo!.extension,
      file_url: fileUrl,
      file_size: file.size,
      mime_type: file.type,
      status,
      extracted_data: extractedData as any,
      generated_entries_url: journalEntriesUrl,
      uploaded_at: new Date().toISOString(),
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        document: {
          id: documentRecord.id,
          name: file.name,
          size: file.size,
          type: file.type,
          status,
          fileUrl,
          journalEntriesUrl,
          extractedData,
          needsReview: status === 'pending',
        },
        message: 'Document uploaded and processed successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error uploading document:', error);

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

// GET handler - returns upload information and limits
export async function loader() {
  return new Response(
    JSON.stringify({
      maxFileSize: MAX_FILE_SIZE_BYTES,
      maxFileSizeMB: Math.floor(MAX_FILE_SIZE_BYTES / (1024 * 1024)),
      allowedTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      usage: {
        method: 'POST',
        endpoint: '/api/documents/upload',
        contentType: 'multipart/form-data',
        body: 'FormData with "file" field',
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
