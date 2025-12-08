/**
 * CSRF Protection using custom headers
 *
 * Cross-Site Request Forgery (CSRF) attacks are prevented by requiring
 * a custom header that can only be set by same-origin JavaScript.
 *
 * Attackers cannot set custom headers in cross-origin requests due to
 * Same-Origin Policy, making this an effective CSRF protection mechanism.
 */

export const CSRF_HEADER_NAME = 'X-Requested-With';
export const CSRF_HEADER_VALUE = 'XMLHttpRequest';

/**
 * Validate that a request includes the required CSRF header
 *
 * @param request - The incoming request to validate
 * @returns Error response if invalid, null if valid
 */
export function validateCSRFHeader(request: Request): Response | null {
  const csrfHeader = request.headers.get(CSRF_HEADER_NAME);

  if (!csrfHeader || csrfHeader !== CSRF_HEADER_VALUE) {
    return new Response(
      JSON.stringify({
        error: 'Invalid or missing CSRF header',
        message: 'This request appears to be from an untrusted source',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return null; // Valid
}

/**
 * Get headers to include in fetch requests for CSRF protection
 *
 * Usage:
 *   fetch('/api/endpoint', {
 *     method: 'POST',
 *     headers: {
 *       ...getCSRFHeaders(),
 *       'Content-Type': 'application/json',
 *     },
 *     body: JSON.stringify(data),
 *   })
 */
export function getCSRFHeaders(): Record<string, string> {
  return {
    [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
  };
}
