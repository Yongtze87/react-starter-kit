/**
 * Client-side utility for downloading files from API endpoints
 */

export interface ReportRequest {
  reportType: 'profit_loss' | 'expense_report';
  format: 'excel' | 'pdf';
  fiscalYear: number;
  fiscalQuarter?: number;
}

/**
 * Download a report from the API
 */
export async function downloadReport(request: ReportRequest): Promise<void> {
  try {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate report');
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = `report_${request.fiscalYear}.${request.format === 'excel' ? 'xlsx' : 'pdf'}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match) {
        fileName = match[1];
      }
    }

    // Convert response to blob
    const blob = await response.blob();

    // Trigger download
    triggerDownload(blob, fileName);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}

/**
 * Send a chat message to the AI assistant
 */
export async function sendChatMessage(
  message: string,
  sessionId: string
): Promise<{
  success: boolean;
  response: {
    message: string;
    confidence: number;
    intent: string;
    needsEscalation: boolean;
    data?: any;
    suggestions?: string[];
  };
}> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
}

/**
 * Trigger browser download of a Blob
 */
export function triggerDownload(blob: Blob, fileName: string): void {
  // Create object URL
  const url = URL.createObjectURL(blob);

  // Create temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file type for uploads
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Generate a unique session ID for chat
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create session ID from sessionStorage
 */
export function getOrCreateSessionId(): string {
  const storageKey = 'chat_session_id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

/**
 * Clear chat session
 */
export function clearChatSession(): void {
  sessionStorage.removeItem('chat_session_id');
}
