import { z } from "zod";

import { BLOOD_GROUPS } from "@/lib/domain";
import type { BloodGroup } from "@/types/api";

/**
 * The blood request form, split the way the wizard asks for it.
 *
 * Each step owns its own schema so a step can be validated on its own before
 * the next one opens — the alternative, validating everything at the end,
 * means someone fills three screens and only then learns the first was wrong.
 * The full schema is the three composed, which is what actually gets sent.
 */

const bloodGroupEnum = z.enum(BLOOD_GROUPS as [BloodGroup, ...BloodGroup[]]);

export const patientStepSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .max(120, "At most 120 characters"),
  bloodGroup: bloodGroupEnum,
  unitsNeeded: z.coerce
    .number()
    .int("Whole units only")
    .min(1, "At least one unit")
    .max(10, "More than 10 units needs a hospital blood bank, not a donor drive"),
  reason: z.string().trim().max(500, "At most 500 characters").optional().or(z.literal("")),
});

export const hospitalStepSchema = z.object({
  hospitalName: z.string().trim().min(2, "At least 2 characters").max(160, "At most 160 characters"),
  hospitalAddress: z
    .string()
    .trim()
    .min(4, "Give enough for a donor to find it")
    .max(240, "At most 240 characters"),
  district: z.string().trim().min(2, "Required").max(80, "At most 80 characters"),
  city: z.string().trim().min(2, "Required").max(80, "At most 80 characters"),
});

export const timingStepSchema = z.object({
  neededAt: z
    .string()
    .min(1, "Required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Not a valid date")
    .refine((value) => Date.parse(value) > Date.now(), "The deadline has to be in the future"),
  urgency: z.enum(["NORMAL", "URGENT", "CRITICAL"]),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Use digits, spaces or dashes, optionally starting with +"),
});

export const createRequestSchema = patientStepSchema
  .merge(hospitalStepSchema)
  .merge(timingStepSchema);

export type CreateRequestValues = z.infer<typeof createRequestSchema>;

/** The fields each step is responsible for, in order. */
export const REQUEST_STEPS = [
  {
    id: "patient",
    title: "The patient",
    blurb: "Who needs blood, which group, and how much.",
    fields: ["patientName", "bloodGroup", "unitsNeeded", "reason"],
  },
  {
    id: "hospital",
    title: "Where to go",
    blurb: "A donor has to be able to find the place.",
    fields: ["hospitalName", "hospitalAddress", "district", "city"],
  },
  {
    id: "timing",
    title: "When and who to call",
    blurb: "The deadline decides how the request is ranked.",
    fields: ["neededAt", "urgency", "contactPhone"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  blurb: string;
  fields: ReadonlyArray<keyof CreateRequestValues>;
}>;

export type RequestStepId = (typeof REQUEST_STEPS)[number]["id"];
