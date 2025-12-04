// Document processing configuration and constants

export const ALLOWED_FILE_TYPES = {
  'application/pdf': { extension: '.pdf', name: 'PDF' },
  'image/jpeg': { extension: '.jpg', name: 'JPEG Image' },
  'image/jpg': { extension: '.jpg', name: 'JPG Image' },
  'image/png': { extension: '.png', name: 'PNG Image' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    extension: '.xlsx',
    name: 'Excel Spreadsheet',
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: '.docx',
    name: 'Word Document',
  },
} as const;

export const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export type AllowedMimeType = keyof typeof ALLOWED_FILE_TYPES;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File): FileValidationResult {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Check file type
  const mimeType = file.type as AllowedMimeType;
  if (!ALLOWED_FILE_TYPES[mimeType]) {
    const allowedTypes = Object.values(ALLOWED_FILE_TYPES)
      .map((t) => t.name)
      .join(', ');
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${allowedTypes}`,
    };
  }

  // Get file extension
  const extension = ALLOWED_FILE_TYPES[mimeType].extension;

  return {
    valid: true,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension,
    },
  };
}

/**
 * Generate unique file name for storage
 */
export function generateUniqueFileName(originalName: string, companyId: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${companyId}/${timestamp}_${randomString}_${sanitizedName}`;
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
 * Get file type category for processing
 */
export function getFileCategory(mimeType: string): 'image' | 'pdf' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'document';
}

/**
 * Check if file type supports vision/OCR extraction
 */
export function supportsVisionExtraction(mimeType: string): boolean {
  const category = getFileCategory(mimeType);
  return category === 'image' || category === 'pdf';
}

/**
 * Convert File to base64 for API transmission
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert File to Buffer for server-side processing
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Extract text from document type (for simple text extraction)
 */
export function getDocumentTypeDescription(mimeType: string): string {
  const typeInfo = ALLOWED_FILE_TYPES[mimeType as AllowedMimeType];
  return typeInfo ? typeInfo.name : 'Unknown Document';
}
