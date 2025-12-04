import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Export download and file utilities
export {
  downloadReport,
  sendChatMessage,
  triggerDownload,
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  generateSessionId,
  getOrCreateSessionId,
  clearChatSession,
  type ReportRequest,
} from './utils/download-helper';
