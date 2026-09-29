import { z } from "zod";

/**
 * These mirror the backend's own rules exactly.
 *
 * Validating client-side is a courtesy — the server validates again and is the
 * authority — but the two must agree, or a form will happily accept something
 * the API then rejects, and the user gets a mystery error instead of a hint
 * next to the field.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("That does not look like an email address")
  .max(255, "Email must be at most 255 characters");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(128, "At most 128 characters")
  .regex(/[a-z]/, "Needs a lowercase letter")
  .regex(/[A-Z]/, "Needs an uppercase letter")
  .regex(/\d/, "Needs a number");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, "Use digits, spaces or dashes, optionally starting with +");

export const loginSchema = z.object({
  email: emailSchema,
  // Login only checks the password against the hash, so the policy is not
  // re-applied here — an old account should still be able to sign in.
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "At least 2 characters").max(80, "At most 80 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please repeat your password"),
    // The API only lets the public register these two — ADMIN comes from the
    // seed, and asking for it is rejected server-side.
    role: z.enum(["DONOR", "REQUESTER"]),
    phone: phoneSchema.optional().or(z.literal("")),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "The two passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;
