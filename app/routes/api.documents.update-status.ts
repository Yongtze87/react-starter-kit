import type { ActionFunctionArgs } from 'react-router';
import { json } from 'react-router';
import { getCurrentUserProfile } from '~/lib/supabase';
import { updateDocumentStatus } from '~/lib/supabase/queries';

/**
 * Document Status Update API endpoint
 * POST /api/documents/update-status
 * Body: {
 *   documentId: string,
 *   status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected',
 *   adminNotes?: string
 * }
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Get current user
    const userProfile = await getCurrentUserProfile();

    if (!userProfile || !userProfile.profile) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (userProfile.profile.role !== 'admin') {
      return json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { documentId, status, adminNotes } = body;

    // Validate input
    if (!documentId || typeof documentId !== 'string') {
      return json({ error: 'Document ID is required' }, { status: 400 });
    }

    if (!status || !['pending', 'processing', 'completed', 'failed', 'rejected'].includes(status)) {
      return json(
        {
          error:
            'Invalid status. Must be: pending, processing, completed, failed, or rejected',
        },
        { status: 400 }
      );
    }

    // Update document status
    const updatedDocument = await updateDocumentStatus(documentId, status, {
      reviewed_by: userProfile.profile.id,
      reviewed_at: new Date().toISOString(),
      processed_at:
        status === 'completed' || status === 'rejected' || status === 'failed'
          ? new Date().toISOString()
          : undefined,
      admin_notes: adminNotes || undefined,
    });

    return json({
      success: true,
      document: {
        id: updatedDocument.id,
        status: updatedDocument.status,
        reviewedBy: updatedDocument.reviewed_by,
        reviewedAt: updatedDocument.reviewed_at,
        processedAt: updatedDocument.processed_at,
        adminNotes: updatedDocument.admin_notes,
      },
      message: 'Document status updated successfully',
    });
  } catch (error) {
    console.error('Error updating document status:', error);

    return json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET handler - returns supported statuses
export async function loader() {
  return json({
    supportedStatuses: ['pending', 'processing', 'completed', 'failed', 'rejected'],
    statusDescriptions: {
      pending: 'Document uploaded, awaiting admin review',
      processing: 'Document approved, ready for posting',
      completed: 'Entries posted to accounting system',
      failed: 'Extraction or processing failed',
      rejected: 'Admin rejected the document',
    },
    usage: {
      method: 'POST',
      endpoint: '/api/documents/update-status',
      body: {
        documentId: 'string (required)',
        status: 'pending | processing | completed | failed | rejected (required)',
        adminNotes: 'string (optional)',
      },
      requiredRole: 'admin',
    },
  });
}
