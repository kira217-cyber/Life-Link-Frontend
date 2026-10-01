import { z } from "zod";

import { BLOOD_GROUPS, DONOR_ELIGIBILITY } from "@/lib/domain";
import { phoneSchema } from "@/lib/validation/auth";
import type { BloodGroup } from "@/types/api";

/**
 * Profile forms, matching the API's own rules.
 *
 * The donor profile is the record matching actually runs on — blood group,
 * location and the date of the last donation all decide whether an invitation
 * reaches this person — so the validation here is deliberately as strict as
 * the server's rather than a looser front for it.
 */

const bloodGroupEnum = z.enum(BLOOD_GROUPS as [BloodGroup, ...BloodGroup[]]);

export const donorProfileSchema = z.object({
  bloodGroup: bloodGroupEnum,
  dateOfBirth: z
    .string()
    .min(1, "Required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Not a valid date")
    .refine((value) => Date.parse(value) <= Date.now(), "That date is in the future"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNDISCLOSED"]),
  weightKg: z
    .union([z.coerce.number().min(30, "At least 30 kg").max(300, "At most 300 kg"), z.literal("")])
    .optional(),
  district: z.string().trim().min(2, "Required").max(80, "At most 80 characters"),
  city: z.string().trim().min(2, "Required").max(80, "At most 80 characters"),
  address: z
    .union([z.string().trim().min(3, "At least 3 characters").max(255, "At most 255 characters"), z.literal("")])
    .optional(),
  lastDonationAt: z
    .string()
    .optional()
    .refine(
      (value) => !value || (!Number.isNaN(Date.parse(value)) && Date.parse(value) <= Date.now()),
      "That date is in the future",
    ),
  isAvailable: z.boolean(),
});

export type DonorProfileValues = z.infer<typeof donorProfileSchema>;

export const GENDER_OPTIONS = [
  { value: "UNDISCLOSED", label: "Prefer not to say" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

/** The three fields the API lets someone change about their own account. */
export const accountSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100, "At most 100 characters"),
  phone: phoneSchema.optional().or(z.literal("")),
  avatarUrl: z
    .union([z.string().trim().url("Needs to be a full URL, starting with https://").max(500), z.literal("")])
    .optional(),
});

export type AccountValues = z.infer<typeof accountSchema>;

/** Mirrors the eligibility rules, for the hint shown beside the form. */
export const ELIGIBILITY_HINTS = {
  age: `${DONOR_ELIGIBILITY.MIN_AGE_YEARS}–${DONOR_ELIGIBILITY.MAX_AGE_YEARS} years`,
  cooldown: `${DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION} days between donations`,
  weight: `at least ${DONOR_ELIGIBILITY.MIN_WEIGHT_KG} kg`,
} as const;
