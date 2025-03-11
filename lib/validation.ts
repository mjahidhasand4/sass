import { z } from "zod";

export const registerSchema = z.object({
  phone: z
    .string()
    .min(1, { message: "Enter your phone number" })
    .regex(/^\d+$/, { message: "Enter a valid mobile number" }),
  password: z
    .string()
    .min(6, { message: "Passwords must be at least 6 characters" }),
  dateOfBirth: z
    .string()
    .min(1, { message: "Enter your date of birth" })
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Enter a valid date of birth" }
    ),
  gender: z.enum(["male", "female"], {
    message: "Select your gender",
  }),
});
