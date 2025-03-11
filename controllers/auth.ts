import { supabase } from "@/lib";
import { registerSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const errors = {
  phone: {
    required: "Enter your phone number",
    invalid: "Enter a valid mobile number",
    exists: "An account with this mobile number already exists",
    notVerified: "Phone number not verified. Please verify with OTP first.",
  },
  password: {
    required: "Enter your password",
    short: "Passwords must be at least 6 characters",
  },
  dateOfBirth: {
    required: "Enter your date of birth",
    invalid: "Enter a valid date of birth",
  },
  gender: {
    required: "Select your gender",
  },
  otp: {
    required: "Enter the verification code",
    invalid: "Invalid verification code",
    expired: "Verification code has expired. Please request a new one.",
  },
};

/**
 * Registers a new user using Supabase Auth
 * Requires phone number to be verified with OTP first
 */
export async function registerUserWithSupabase(data: {
  phone: string;
  password: string;
  dateOfBirth: string;
  gender: "male" | "female";
}) {
  try {
    // Validate input using Zod
    const validatedData = registerSchema.parse(data);
    const { phone, password, dateOfBirth, gender } = validatedData;

    // 🔹 Use Supabase phone authentication instead of email-based auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone,
      password,
      options: {
        data: {
          dateOfBirth,
          gender,
        },
      },
    });

    if (authError) {
      console.error("Supabase Auth error:", authError);
      if (authError.message.includes("already registered")) {
        throw { error: "Phone number already registered", status: 409 };
      }
      throw { error: authError.message, status: 500 };
    }

    // 🔹 Insert user data into the profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user?.id,
      phone,
      date_of_birth: new Date(dateOfBirth),
      gender,
    });

    if (profileError) {
      console.error("Supabase profile error:", profileError);
      if (authData.user) {
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      throw { error: profileError.message, status: 500 };
    }

    return {
      message: "Your account has been created successfully!",
      user: {
        id: authData.user?.id,
        phone,
        dateOfBirth,
        gender,
      },
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const validationErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.includes("phone")) validationErrors.phone = err.message;
        if (err.path.includes("password"))
          validationErrors.password = err.message;
        if (err.path.includes("dateOfBirth"))
          validationErrors.dateOfBirth = err.message;
        if (err.path.includes("gender")) validationErrors.gender = err.message;
      });
      throw { validationErrors, status: 400 };
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "error" in error &&
      "status" in error
    ) {
      throw error;
    }

    console.error("Registration error:", error);
    throw { error: "Something went wrong. Please try again.", status: 500 };
  }
}

/**
 * Authenticates a user (Login) using Supabase Auth
 */
export async function loginUserWithSupabase(phone: string, password: string) {
  try {
    // Create a unique email-like identifier from the phone number
    const email = `${phone}@phone.user`;

    // Sign in the user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase Auth login error:", error);
      throw { error: "Incorrect phone number or password", status: 401 };
    }

    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Supabase profile fetch error:", profileError);
      throw { error: "Failed to fetch user profile", status: 500 };
    }

    return {
      message: "Login successful",
      user: {
        id: data.user.id,
        phone: profileData.phone,
        dateOfBirth: profileData.date_of_birth,
        gender: profileData.gender,
      },
    };
  } catch (error) {
    // Handle custom error objects with error and status properties
    if (
      typeof error === "object" &&
      error !== null &&
      "error" in error &&
      "status" in error
    ) {
      throw error;
    }

    console.error("Login error:", error);
    throw { error: "Something went wrong. Please try again.", status: 500 };
  }
}
