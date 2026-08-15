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
 * - Escapes HTML entities (XSS protection)
 * - Removes common SQL injection patterns as a defense-in-depth measure
 * - Strips null bytes and control characters
 */
export function sanitizeInput(str: string): string {
  if (!str) return '';

  // Trim whitespace
  let sanitized = str.trim();

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove common SQL injection patterns (defense-in-depth)
  // These patterns should never appear in legitimate form input
  const sqlPatterns = [
    /(\b)(DROP|ALTER|DELETE|INSERT|UPDATE|CREATE|EXEC|EXECUTE|UNION\s+SELECT)\b/gi,
    /--\s/g,
    /;\s*(DROP|ALTER|DELETE|INSERT|UPDATE|CREATE)/gi,
    /\/\*[\s\S]*?\*\//g,
  ];

  for (const pattern of sqlPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Escape HTML entities
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

/**
 * Sanitizes chat messages before sending to the AI API.
 * Less aggressive than sanitizeInput since chat messages need to preserve
 * natural language, but still protects against injection attacks.
 * - Trims whitespace
 * - Removes null bytes and control characters
 * - Strips potential prompt injection markers
 * - Escapes HTML entities
 */
export function sanitizeChatMessage(str: string): string {
  if (!str) return '';

  // Trim whitespace
  let sanitized = str.trim();

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove common SQL injection patterns (defense-in-depth)
  const sqlPatterns = [
    /(\b)(DROP|ALTER|DELETE|INSERT|UPDATE|CREATE|EXEC|EXECUTE)\s+(TABLE|DATABASE|INDEX|PROCEDURE)/gi,
    /;\s*(DROP|ALTER|DELETE|INSERT|UPDATE|CREATE)/gi,
    /\/\*[\s\S]*?\*\//g,
  ];

  for (const pattern of sqlPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Escape HTML entities for XSS protection
  sanitized = escapeHtml(sanitized);

  return sanitized;
}
