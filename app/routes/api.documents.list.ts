import type { LoaderFunctionArgs } from 'react-router';
import { json } from 'react-router';
import { getCurrentUserProfile } from '~/lib/supabase';
import { getDocuments, getPendingDocuments } from '~/lib/supabase/queries';

/**
 * Document List API endpoint
 * GET /api/documents/list?status=pending
 * Returns list of documents for current user or all pending (for admins)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get current user
    const userProfile = await getCurrentUserProfile();

    if (!userProfile || !userProfile.profile) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;
    const isAdmin = userProfile.profile.role === 'admin';

    let documents;

    // Admins can see all pending documents across companies
    if (isAdmin && (status === 'pending' || status === 'processing')) {
      documents = await getPendingDocuments();
    } else {
      // Regular users see their company's documents
      documents = await getDocuments(userProfile.profile.company_id, status || undefined);
    }

    return json({
      success: true,
      documents: documents.map((doc) => ({
        id: doc.id,
        name: doc.document_name,
        type: doc.document_type,
        size: doc.file_size,
        mimeType: doc.mime_type,
        status: doc.status,
        fileUrl: doc.file_url,
        journalEntriesUrl: doc.generated_entries_url,
        extractedData: doc.extracted_data,
        uploadedAt: doc.uploaded_at,
        processedAt: doc.processed_at,
        reviewedBy: doc.reviewed_by,
        reviewedAt: doc.reviewed_at,
        adminNotes: doc.admin_notes,
      })),
      count: documents.length,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);

    return json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
