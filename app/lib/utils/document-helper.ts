/**
 * Client-side utility for document uploads and management
 */

export interface UploadDocumentResponse {
  success: boolean;
  document?: {
    id: string;
    name: string;
    size: number;
    type: string;
    status: string;
    fileUrl: string;
    journalEntriesUrl?: string;
    extractedData?: any;
    needsReview: boolean;
  };
  error?: string;
  message?: string;
}

export interface DocumentListResponse {
  success: boolean;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    mimeType: string;
    status: string;
    fileUrl: string;
    journalEntriesUrl?: string;
    extractedData?: any;
    uploadedAt: string;
    processedAt?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    adminNotes?: string;
  }>;
  count: number;
  error?: string;
}

export interface UpdateStatusResponse {
  success: boolean;
  document?: {
    id: string;
    status: string;
    reviewedBy?: string;
    reviewedAt?: string;
    processedAt?: string;
    adminNotes?: string;
  };
  error?: string;
  message?: string;
}

/**
 * Upload a document to the server
 */
export async function uploadDocument(file: File): Promise<UploadDocumentResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload document');
    }

    return data;
  } catch (error) {
    console.error('Error uploading document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get list of documents
 */
export async function getDocuments(status?: string): Promise<DocumentListResponse> {
  try {
    const url = status ? `/api/documents/list?status=${status}` : '/api/documents/list';

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch documents');
    }

    return data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return {
      success: false,
      documents: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update document status (admin only)
 */
export async function updateDocumentStatus(
  documentId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected',
  adminNotes?: string
): Promise<UpdateStatusResponse> {
  try {
    const response = await fetch('/api/documents/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        status,
        adminNotes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update document status');
    }

    return data;
  } catch (error) {
    console.error('Error updating document status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download journal entries Excel file
 */
export async function downloadJournalEntries(url: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();

    // Trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

/**
 * Format document status for display
 */
export function formatDocumentStatus(status: string): {
  label: string;
  color: string;
  description: string;
} {
  const statusMap: Record<
    string,
    { label: string; color: string; description: string }
  > = {
    pending: {
      label: 'Pending Review',
      color: 'yellow',
      description: 'Awaiting admin review',
    },
    processing: {
      label: 'Processing',
      color: 'blue',
      description: 'Approved, ready for posting',
    },
    completed: {
      label: 'Completed',
      color: 'green',
      description: 'Posted to accounting system',
    },
    failed: {
      label: 'Failed',
      color: 'red',
      description: 'Processing failed',
    },
    rejected: {
      label: 'Rejected',
      color: 'red',
      description: 'Admin rejected',
    },
  };

  return (
    statusMap[status] || {
      label: 'Unknown',
      color: 'gray',
      description: 'Unknown status',
    }
  );
}

/**
 * Validate file before upload (client-side)
 */
export function validateFileBeforeUpload(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_SIZE_MB}MB limit`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF, images, Excel, or Word documents.',
    };
  }

  return { valid: true };
}
