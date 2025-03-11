"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Registration steps
enum STEP {
  SEND_OTP = "send_otp",
  VERIFY_OTP = "verify_otp",
  COMPLETE_REGISTRATION = "complete_registration",
}

const Register = () => {
  const router = useRouter();

  // Form state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");

  // UI state
  const [currentStep, setCurrentStep] = useState<STEP>(STEP.SEND_OTP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Handle sending OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: STEP.SEND_OTP,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      setCurrentStep(STEP.VERIFY_OTP);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: STEP.VERIFY_OTP,
          phone,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      setCurrentStep(STEP.COMPLETE_REGISTRATION);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError(error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle completing registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: STEP.COMPLETE_REGISTRATION,
          phone,
          password,
          dateOfBirth,
          gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete registration");
      }

      // Registration successful, redirect to login
      router.push("/login?registered=true");
    } catch (error) {
      console.error("Error completing registration:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to complete registration"
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: STEP.SEND_OTP,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setOtpSent(true);
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError(error instanceof Error ? error.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const handleGoBack = () => {
    if (currentStep === STEP.VERIFY_OTP) {
      setCurrentStep(STEP.SEND_OTP);
    } else if (currentStep === STEP.COMPLETE_REGISTRATION) {
      setCurrentStep(STEP.VERIFY_OTP);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {currentStep === STEP.SEND_OTP &&
              "Enter your phone number to get started"}
            {currentStep === STEP.VERIFY_OTP &&
              "Enter the verification code sent to your phone"}
            {currentStep === STEP.COMPLETE_REGISTRATION &&
              "Complete your profile to finish registration"}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === STEP.SEND_OTP
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              1
            </div>
            <span className="text-xs mt-1">Phone</span>
          </div>
          <div className="flex-1 flex items-center">
            <div
              className={`h-1 w-full ${
                currentStep !== STEP.SEND_OTP ? "bg-indigo-600" : "bg-gray-200"
              }`}
            ></div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === STEP.VERIFY_OTP
                  ? "bg-indigo-600 text-white"
                  : currentStep === STEP.COMPLETE_REGISTRATION
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              2
            </div>
            <span className="text-xs mt-1">Verify</span>
          </div>
          <div className="flex-1 flex items-center">
            <div
              className={`h-1 w-full ${
                currentStep === STEP.COMPLETE_REGISTRATION
                  ? "bg-indigo-600"
                  : "bg-gray-200"
              }`}
            ></div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === STEP.COMPLETE_REGISTRATION
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              3
            </div>
            <span className="text-xs mt-1">Profile</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Send OTP */}
        {currentStep === STEP.SEND_OTP && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {currentStep === STEP.VERIFY_OTP && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                  placeholder="Enter the 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                We sent a verification code to {phone}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleGoBack}
                className="group relative flex w-1/2 justify-center rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-1/2 justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Complete Registration */}
        {currentStep === STEP.COMPLETE_REGISTRATION && (
          <form
            className="mt-8 space-y-6"
            onSubmit={handleCompleteRegistration}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <div className="mt-1">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender
                </label>
                <div className="mt-1">
                  <select
                    id="gender"
                    name="gender"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as "male" | "female")
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleGoBack}
                className="group relative flex w-1/2 justify-center rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-1/2 justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
