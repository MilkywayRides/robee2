// lib/api-rate-limiter.ts

// Simple in-memory rate limiter for the Gemini API
// This is a basic implementation that works for a single browser session
// For a production app, you'd want to use a more robust solution with server-side tracking

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// Default quota for free tier: 50 requests per day
const DEFAULT_QUOTA = 50;
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Store rate limit info in localStorage to persist across page refreshes
const getRateLimitInfo = (): RateLimitInfo => {
  if (typeof window === 'undefined') {
    return { count: 0, resetTime: Date.now() + RESET_INTERVAL };
  }

  const stored = localStorage.getItem('gemini-api-rate-limit');
  if (!stored) {
    return { count: 0, resetTime: Date.now() + RESET_INTERVAL };
  }

  try {
    const info = JSON.parse(stored) as RateLimitInfo;
    
    // Check if we need to reset the counter
    if (Date.now() > info.resetTime) {
      return { count: 0, resetTime: Date.now() + RESET_INTERVAL };
    }
    
    return info;
  } catch (e) {
    return { count: 0, resetTime: Date.now() + RESET_INTERVAL };
  }
};

const saveRateLimitInfo = (info: RateLimitInfo): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gemini-api-rate-limit', JSON.stringify(info));
};

export const checkRateLimit = (quota: number = DEFAULT_QUOTA): { 
  allowed: boolean; 
  remaining: number;
  resetTime: number;
} => {
  const info = getRateLimitInfo();
  
  // If we've exceeded the quota, check if we need to reset
  if (info.count >= quota) {
    if (Date.now() > info.resetTime) {
      // Reset the counter
      const newInfo = { count: 0, resetTime: Date.now() + RESET_INTERVAL };
      saveRateLimitInfo(newInfo);
      return { 
        allowed: true, 
        remaining: quota,
        resetTime: newInfo.resetTime
      };
    }
    
    // Still over quota
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: info.resetTime
    };
  }
  
  // Under quota
  return { 
    allowed: true, 
    remaining: quota - info.count,
    resetTime: info.resetTime
  };
};

export const incrementRateLimit = (): void => {
  const info = getRateLimitInfo();
  info.count += 1;
  saveRateLimitInfo(info);
};

export const getRateLimitStatus = (quota: number = DEFAULT_QUOTA): {
  used: number;
  remaining: number;
  resetTime: number;
} => {
  const info = getRateLimitInfo();
  
  // Check if we need to reset
  if (Date.now() > info.resetTime) {
    return {
      used: 0,
      remaining: quota,
      resetTime: Date.now() + RESET_INTERVAL
    };
  }
  
  return {
    used: info.count,
    remaining: Math.max(0, quota - info.count),
    resetTime: info.resetTime
  };
}; 