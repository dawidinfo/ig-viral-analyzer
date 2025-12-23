/**
 * Security Service - Rate Limiting, Input Validation, and Protection
 */

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configurations
const RATE_LIMITS = {
  // API calls per minute
  analysis: { limit: 10, window: 60000 }, // 10 analyses per minute
  search: { limit: 30, window: 60000 }, // 30 searches per minute
  export: { limit: 5, window: 60000 }, // 5 exports per minute
  admin: { limit: 100, window: 60000 }, // 100 admin calls per minute
  default: { limit: 60, window: 60000 }, // 60 calls per minute default
};

// Forbidden content patterns
const FORBIDDEN_PATTERNS = [
  // SQL Injection
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
  /(--)|(;)|(\/\*)|(\*\/)/,
  // XSS
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /<[^>]+on\w+\s*=/gi,
  /javascript:/gi,
  // Path traversal
  /\.\.\//g,
  /\.\.\\\//g,
  // Command injection
  /[;&|`$]/,
];

// Adult content keywords for username/content filtering
const ADULT_KEYWORDS = [
  "porn", "xxx", "adult", "nsfw", "onlyfans", "nude", "naked", "sex",
  "escort", "cam", "fetish", "erotic", "stripper", "playboy", "playmate",
  "hentai", "fap", "milf", "teen", "amateur", "hardcore", "softcore"
];

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  limit: number;
}

export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  issues: string[];
}

export interface SecurityCheckResult {
  safe: boolean;
  reason?: string;
  flagged?: boolean;
}

/**
 * Check rate limit for a specific action
 */
export function checkRateLimit(
  identifier: string, 
  action: keyof typeof RATE_LIMITS = "default"
): RateLimitResult {
  const config = RATE_LIMITS[action] || RATE_LIMITS.default;
  const key = `${identifier}:${action}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + config.window };
    rateLimitStore.set(key, entry);
  }
  
  // Check limit
  const allowed = entry.count < config.limit;
  
  if (allowed) {
    entry.count++;
  }
  
  return {
    allowed,
    remaining: Math.max(0, config.limit - entry.count),
    resetIn: Math.max(0, entry.resetTime - now),
    limit: config.limit,
  };
}

/**
 * Validate and sanitize input string
 */
export function validateInput(input: string, maxLength: number = 500): ValidationResult {
  const issues: string[] = [];
  let sanitized = input;
  
  // Check length
  if (input.length > maxLength) {
    issues.push(`Input exceeds maximum length of ${maxLength}`);
    sanitized = input.substring(0, maxLength);
  }
  
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(sanitized)) {
      issues.push("Potentially malicious content detected");
      sanitized = sanitized.replace(pattern, "");
    }
  }
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");
  
  return {
    valid: issues.length === 0,
    sanitized,
    issues,
  };
}

/**
 * Validate Instagram username
 */
export function validateUsername(username: string): ValidationResult {
  const issues: string[] = [];
  let sanitized = username.toLowerCase().trim();
  
  // Remove @ if present
  if (sanitized.startsWith("@")) {
    sanitized = sanitized.substring(1);
  }
  
  // Instagram username rules
  if (!/^[a-z0-9._]{1,30}$/.test(sanitized)) {
    issues.push("Invalid Instagram username format");
  }
  
  // Check for consecutive periods
  if (/\.\./.test(sanitized)) {
    issues.push("Username cannot contain consecutive periods");
  }
  
  // Check for leading/trailing periods
  if (sanitized.startsWith(".") || sanitized.endsWith(".")) {
    issues.push("Username cannot start or end with a period");
  }
  
  return {
    valid: issues.length === 0,
    sanitized,
    issues,
  };
}

/**
 * Check if content contains adult/forbidden material
 */
export function checkContentSafety(content: string): SecurityCheckResult {
  const lowerContent = content.toLowerCase();
  
  for (const keyword of ADULT_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return {
        safe: false,
        reason: `Content contains forbidden keyword: ${keyword}`,
        flagged: true,
      };
    }
  }
  
  return { safe: true };
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

/**
 * Hash sensitive data (for logging)
 */
export function hashForLogging(data: string): string {
  // Simple hash for logging - not for security purposes
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const issues: string[] = [];
  const sanitized = email.toLowerCase().trim();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    issues.push("Invalid email format");
  }
  
  if (sanitized.length > 320) {
    issues.push("Email exceeds maximum length");
  }
  
  return {
    valid: issues.length === 0,
    sanitized,
    issues,
  };
}

/**
 * Check if IP is suspicious (basic check)
 */
export function checkIP(ip: string): SecurityCheckResult {
  // Basic validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return { safe: false, reason: "Invalid IP format" };
  }
  
  // Check for localhost/private ranges (might be suspicious in production)
  const privateRanges = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
  ];
  
  // In production, you might want to flag these
  // For now, we allow them
  
  return { safe: true };
}

/**
 * Sanitize object for safe logging
 */
export function sanitizeForLogging(obj: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ["password", "token", "secret", "key", "auth", "credit"];
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeForLogging(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Security headers for responses
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: "low" | "medium" | "high" | "critical" = "low"
): void {
  const timestamp = new Date().toISOString();
  const sanitizedDetails = sanitizeForLogging(details);
  
  console.log(`[SECURITY][${severity.toUpperCase()}][${timestamp}] ${event}`, sanitizedDetails);
  
  // In production, you would send this to a security monitoring service
  // e.g., Sentry, DataDog, or a custom SIEM
}
