/**
 * Authentication state cleanup utilities for security
 * Prevents auth limbo states and ensures clean session management
 */

export const cleanupAuthState = () => {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.warn('Auth cleanup failed:', error);
  }
};

export const performSecureSignOut = async (supabase: any) => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out
    await supabase.auth.signOut({ scope: 'global' });
    
    // Force page reload for clean state
    window.location.href = '/auth';
  } catch (error) {
    console.warn('Secure sign out failed:', error);
    // Force redirect even if signOut fails
    window.location.href = '/auth';
  }
};

export const performSecureSignIn = async (
  supabase: any, 
  email: string, 
  password: string
) => {
  try {
    // Rate limiting check
    const userKey = `signin_${email}`;
    const rateLimit = checkRateLimit(userKey, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
    
    if (!rateLimit) {
      throw new Error('Too many sign-in attempts. Please try again later.');
    }

    // Clean up existing state
    cleanupAuthState();
    
    // Attempt global sign out first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    // Sign in with email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Force page reload for clean state
      window.location.href = '/';
    }
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Rate limiting for sensitive operations
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
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