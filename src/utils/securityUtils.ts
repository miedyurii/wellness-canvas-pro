/**
 * Security utilities for enhanced application security
 */

// Rate limiting for sensitive operations
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};

// Content Security Policy headers (for future implementation)
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.supabase.co; " +
    "frame-ancestors 'none';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
});

// Secure data deletion utility
export const secureDataDeletion = (data: any): void => {
  if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        // Overwrite sensitive string data
        data[key] = '*'.repeat(data[key].length);
      }
      delete data[key];
    });
  }
};

// Health data privacy check
export const isHealthDataSensitive = (field: string): boolean => {
  const sensitiveFields = [
    'weight_kg', 'height_cm', 'body_fat_percent', 'bmi',
    'age', 'gender', 'medical_conditions', 'medications'
  ];
  return sensitiveFields.includes(field);
};

// Input sanitization for health metrics
export const sanitizeHealthMetric = (value: any, field: string): number | null => {
  if (value === null || value === undefined || value === '') return null;
  
  const numValue = parseFloat(value.toString());
  if (isNaN(numValue)) return null;
  
  // Field-specific validation ranges
  const ranges: Record<string, [number, number]> = {
    weight_kg: [0.1, 1000],
    height_cm: [1, 300],
    age: [1, 150],
    body_fat_percent: [0, 100],
    bmi: [1, 100],
  };
  
  const [min, max] = ranges[field] || [0, Number.MAX_SAFE_INTEGER];
  return numValue >= min && numValue <= max ? numValue : null;
};

// Log security events (placeholder for future audit system)
export const logSecurityEvent = (event: string, details: any) => {
  console.warn(`[SECURITY] ${event}:`, details);
  // In production, this would send to a secure logging service
};