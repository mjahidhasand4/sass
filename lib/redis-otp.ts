import { supabase } from "./supabase";
import { getRedisClient } from "./redis";

// OTP prefix to avoid key collisions
const OTP_PREFIX = "otp:";
const VERIFIED_PREFIX = "verified:";

/**
 * Generate a random 6-digit OTP code
 * @returns Generated OTP code
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Supabase and store status in Redis
 * @param phone Phone number
 * @param duration Expiration time in minutes (default: 5 minutes)
 * @returns Promise resolving to void
 */
export const sendOtp = async (
  phone: string,
  duration: number = 5
): Promise<void> => {
  // Send OTP via Supabase
  const { error } = await supabase.auth.signInWithOtp({ phone });

  if (error) {
    console.error("Error sending OTP via Supabase:", error);
    throw error;
  }
  
  // Store verification status in Redis with expiration
  const redis = getRedisClient();
  const key = `${OTP_PREFIX}${phone}`;
  
  // We don't store the actual OTP, just mark that an OTP has been sent
  // Supabase will handle the OTP verification
  await redis.set(key, "sent", 'EX', duration * 60); // Convert minutes to seconds
};

/**
 * Verify OTP using Supabase and update Redis verification status
 * @param phone Phone number
 * @param otp OTP code to verify
 * @returns Promise resolving to boolean indicating if OTP is valid
 */
export const verifyOtp = async (
  phone: string,
  otp: string
): Promise<boolean> => {
  const redis = getRedisClient();
  const key = `${OTP_PREFIX}${phone}`;
  const verifiedKey = `${VERIFIED_PREFIX}${phone}`;
  
  // Check if an OTP was sent for this phone
  const otpSent = await redis.get(key);
  if (!otpSent) {
    return false;
  }
  
  try {
    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error || !data.user) {
      console.error("Error verifying OTP:", error);
      return false;
    }
    
    // Mark as verified (keep for 30 days)
    await redis.set(verifiedKey, "true", 'EX', 30 * 24 * 60 * 60);
    
    // Delete the OTP to prevent reuse
    await redis.del(key);

    return true;
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return false;
  }
};

/**
 * Check if a phone number has been verified
 * @param phone Phone number
 * @returns Promise resolving to boolean indicating if phone is verified
 */
export const isPhoneVerified = async (phone: string): Promise<boolean> => {
  const redis = getRedisClient();
  const verifiedKey = `${VERIFIED_PREFIX}${phone}`;
  
  const verified = await redis.get(verifiedKey);
  return verified === "true";
};

/**
 * Get remaining time (in seconds) before OTP expires
 * @param phone Phone number
 * @returns Promise resolving to remaining time in seconds, or null if OTP doesn't exist
 */
export const getOtpTTL = async (phone: string): Promise<number | null> => {
  const redis = getRedisClient();
  const key = `${OTP_PREFIX}${phone}`;
  
  const ttl = await redis.ttl(key);
  return ttl > 0 ? ttl : null;
};

/**
 * Invalidate an OTP for a phone number
 * @param phone Phone number
 * @returns Promise resolving to number of keys deleted (0 or 1)
 */
export const invalidateOtp = async (phone: string): Promise<number> => {
  const redis = getRedisClient();
  const key = `${OTP_PREFIX}${phone}`;
  
  return redis.del(key);
};

/**
 * Invalidate verification status for a phone number
 * @param phone Phone number
 * @returns Promise resolving to number of keys deleted (0 or 1)
 */
export const invalidateVerification = async (phone: string): Promise<number> => {
  const redis = getRedisClient();
  const verifiedKey = `${VERIFIED_PREFIX}${phone}`;
  
  return redis.del(verifiedKey);
}; 