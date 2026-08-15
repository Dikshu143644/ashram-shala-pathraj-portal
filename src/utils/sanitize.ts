/**
 * Input Sanitization Utilities
 *
 * These functions provide defense-in-depth input sanitization for user-provided data.
 * They protect against XSS (Cross-Site Scripting) and SQL injection attacks at the
 * application layer.
 *
 * IMPORTANT: When a real database is connected (e.g., Supabase, MongoDB), always use
 * parameterized queries / prepared statements as the primary defense against SQL injection.
 * These sanitization functions are an additional layer of protection, NOT a replacement
 * for parameterized queries. Example with Supabase:
 *
 *   const { data } = await supabase
 *     .from('students')
 *     .select('*')
 *     .eq('id', studentId);  // Supabase handles parameterization internally
 *
 * Never concatenate user input directly into SQL strings.
 */

/**
 * Escapes HTML entities to prevent XSS attacks.
 * Converts dangerous characters to their HTML entity equivalents.
 */
export function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitizes general user input for form fields.
 * - Trims whitespace
 * - Strips null bytes and control characters
 * - Escapes HTML entities (XSS protection for rendered form data)
 *
 * Note: SQL injection prevention is handled at the database layer via
 * parameterized queries. No SQL stripping is applied here because it
 * mangles legitimate text (e.g., village names, natural language) and
 * there is currently no database to protect.
 */
export function sanitizeInput(str: string): string {
  if (!str) return '';

  // Trim whitespace
  let sanitized = str.trim();

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Escape HTML entities for XSS protection when form data is rendered
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

/**
 * Sanitizes chat messages before sending to the AI API.
 * Only strips null bytes and control characters to preserve natural language.
 *
 * No HTML escaping is applied here because:
 * 1. The message is sent to the Gemini API as plain text (not rendered as HTML)
 * 2. React automatically escapes text when rendering responses in the DOM
 * 3. HTML escaping corrupts legitimate text (e.g., "son's" becomes "son&#x27;s")
 *
 * No SQL stripping is applied because there is no database, and such patterns
 * mangle legitimate text like "drop off" or "delete my old application."
 */
export function sanitizeChatMessage(str: string): string {
  if (!str) return '';

  // Trim whitespace
  let sanitized = str.trim();

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}
