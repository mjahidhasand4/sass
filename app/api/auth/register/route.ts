import { NextResponse } from "next/server";
import { sendOtp, verifyOtp } from "@/lib/redis-otp";
import { registerUserWithSupabase } from "@/controllers";
import { hash } from "bcryptjs";

/**
 * Combined endpoint for the entire OTP-based registration flow
 * Handles all three steps: send OTP, verify OTP, and complete registration
 */
export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { step, phone, otp, password, dateOfBirth, gender } = body;
    // Step 1: Send OTP
    if (step === "send_otp") {
      if (!phone) {
        return NextResponse.json(
          { error: "Phone number is required" },
          { status: 400 }
        );
      }

      // Send the OTP
      await sendOtp(phone);

      return NextResponse.json(
        { message: "OTP sent successfully", step: "verify_otp" },
        { status: 200 }
      );
    }

    // Step 2: Verify OTP
    else if (step === "verify_otp") {
      if (!phone || !otp) {
        return NextResponse.json(
          { error: "Phone number and OTP are required" },
          { status: 400 }
        );
      }

      // Verify the OTP
      const isValid = await verifyOtp(phone, otp);

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid or expired OTP" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          message: "Phone number verified successfully",
          step: "complete_registration",
        },
        { status: 200 }
      );
    }

    // Step 3: Complete registration
    else if (step === "complete_registration") {
      if (!phone || !password || !dateOfBirth || !gender) {
        return NextResponse.json(
          { error: "All fields are required" },
          { status: 400 }
        );
      }

      const hashedPassword = await hash(password, 10);
      await prisma.user.create({
        data: {
          phone,
          password: hashedPassword,
          dateOfBirth: new Date(dateOfBirth),
          gender,
        },
      });

      return NextResponse.json({}, { status: 201 });
    } else {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: error.error || error.validationErrors || "Something went wrong",
      },
      { status: error.status || 500 }
    );
  }
};
