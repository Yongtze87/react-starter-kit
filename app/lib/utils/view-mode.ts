/**
 * View Mode Utility
 * For testing: Switch between client and admin views
 * TODO: Remove this file after testing is complete
 */

const VIEW_MODE_KEY = 'view-mode';

export type ViewMode = 'client' | 'admin';

export function getViewMode(): ViewMode {
  if (typeof window === 'undefined') {
    return 'client';
  }
  return (sessionStorage.getItem(VIEW_MODE_KEY) as ViewMode) || 'client';
}

export function setViewMode(mode: ViewMode): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(VIEW_MODE_KEY, mode);
  }
}

export function isAdminView(): boolean {
  return getViewMode() === 'admin';
}

export function isClientView(): boolean {
  return getViewMode() === 'client';
}
