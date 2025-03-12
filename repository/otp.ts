import {
  sendOtp,
  verifyOtp,
  isPhoneVerified,
  getOtpTTL,
  invalidateOtp,
  invalidateVerification,
} from "@/lib/redis-otp";

class _OTP {
  /**
   * Send an OTP to a phone number via Supabase
   * @param phone Phone number
   * @param duration Expiration time in minutes (default: 5 minutes)
   * @returns Promise resolving to void
   */
  static async send(phone: string, duration: number = 5): Promise<void> {
    await sendOtp(phone, duration);
  }

  /**
   * Verify an OTP for a phone number
   * @param phone Phone number
   * @param code OTP code to verify
   * @returns Promise resolving to boolean indicating if OTP is valid
   */
  static async verifyPhoneOTP(phone: string, code: string): Promise<boolean> {
    return verifyOtp(phone, code);
  }

  /**
   * Check if a phone number has been verified
   * @param phone Phone number
   * @returns Promise resolving to boolean indicating if phone is verified
   */
  static async checkPhoneVerified(phone: string): Promise<boolean> {
    return isPhoneVerified(phone);
  }

  /**
   * Get remaining time before OTP expires
   * @param phone Phone number
   * @returns Promise resolving to remaining time in seconds, or null if OTP doesn't exist
   */
  static async getOTPExpiryTime(phone: string): Promise<number | null> {
    return getOtpTTL(phone);
  }

  /**
   * Delete an OTP for a phone number
   * @param phone Phone number
   * @returns Promise resolving to number of keys deleted (0 or 1)
   */
  static async deletePhoneOTP(phone: string): Promise<number> {
    return invalidateOtp(phone);
  }

  /**
   * Delete verification status for a phone number
   * @param phone Phone number
   * @returns Promise resolving to number of keys deleted (0 or 1)
   */
  static async deletePhoneVerification(phone: string): Promise<number> {
    return invalidateVerification(phone);
  }
}

export const OTP = _OTP;
