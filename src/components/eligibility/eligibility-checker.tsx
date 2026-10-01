"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DONOR_ELIGIBILITY } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;

/** Whole years elapsed, counting month and day rather than subtracting years. */
function ageFrom(dateOfBirth: string, now: Date): number | null {
  const born = new Date(dateOfBirth);
  if (Number.isNaN(born.getTime())) return null;
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const months = now.getUTCMonth() - born.getUTCMonth();
  if (months < 0 || (months === 0 && now.getUTCDate() < born.getUTCDate())) age -= 1;
  return age;
}

interface Verdict {
  eligible: boolean;
  reasons: string[];
  nextEligible: string | null;
}

/**
 * The same rules the API applies, run in the browser.
 *
 * It is a hint, not an authority — the server decides for real when a request
 * is matched. But someone deciding whether to register deserves an answer
 * before they hand over an email address, and every rule here is a number this
 * project already publishes.
 */
function evaluate(input: {
  dateOfBirth: string;
  lastDonationAt: string;
  weightKg: string;
  available: boolean;
}): Verdict | null {
  if (!input.dateOfBirth) return null;

  const now = new Date();
  const reasons: string[] = [];

  const age = ageFrom(input.dateOfBirth, now);
  if (age === null) return null;

  if (age < DONOR_ELIGIBILITY.MIN_AGE_YEARS) {
    reasons.push(`You need to be at least ${DONOR_ELIGIBILITY.MIN_AGE_YEARS} — you are ${age}.`);
  }
  if (age > DONOR_ELIGIBILITY.MAX_AGE_YEARS) {
    reasons.push(`Donors are accepted up to ${DONOR_ELIGIBILITY.MAX_AGE_YEARS} — you are ${age}.`);
  }

  let nextEligible: string | null = null;
  if (input.lastDonationAt) {
    const last = new Date(input.lastDonationAt);
    if (!Number.isNaN(last.getTime())) {
      const elapsed = Math.floor((now.getTime() - last.getTime()) / DAY);
      const next = new Date(last.getTime() + DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION * DAY);
      nextEligible = next.toISOString();
      if (elapsed < DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION) {
        reasons.push(
          `It has been ${elapsed} days since your last donation — ${DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION} are needed.`,
        );
      }
    }
  }

  // An unknown weight is not a failure; only a recorded one below the floor.
  const weight = input.weightKg ? Number(input.weightKg) : null;
  if (weight !== null && Number.isFinite(weight) && weight < DONOR_ELIGIBILITY.MIN_WEIGHT_KG) {
    reasons.push(`Donors need to weigh at least ${DONOR_ELIGIBILITY.MIN_WEIGHT_KG} kg.`);
  }

  if (!input.available) {
    reasons.push("You have marked yourself unavailable, so you are out of matching.");
  }

  return { eligible: reasons.length === 0, reasons, nextEligible };
}

export function EligibilityChecker() {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [lastDonationAt, setLastDonationAt] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [available, setAvailable] = useState(true);

  const verdict = evaluate({ dateOfBirth, lastDonationAt, weightKg, available });

  return (
    <div className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="last">
            Last donation <span className="font-normal text-muted-foreground">(if any)</span>
          </Label>
          <Input
            id="last"
            type="date"
            value={lastDonationAt}
            onChange={(event) => setLastDonationAt(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="weight">
            Weight in kg <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="weight"
            type="number"
            min={30}
            max={200}
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            placeholder="70"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border p-3.5">
          <Label htmlFor="available" className="cursor-pointer">
            Available to donate
          </Label>
          <Switch id="available" checked={available} onCheckedChange={setAvailable} />
        </div>
      </div>

      <div
        className={cn(
          "grid place-items-center rounded-xl border p-6 text-center",
          verdict === null && "border-dashed bg-muted/40",
          verdict?.eligible && "border-success/40 bg-success-soft",
          verdict && !verdict.eligible && "border-warning/40 bg-warning-soft",
        )}
        role="status"
        aria-live="polite"
      >
        {verdict === null ? (
          <p className="text-sm text-muted-foreground">
            Enter your date of birth to see where you stand.
          </p>
        ) : verdict.eligible ? (
          <div>
            <CircleCheck className="mx-auto size-10 text-success" />
            <p className="mt-3 font-heading text-lg font-semibold text-success">
              You can donate today
            </p>
            <p className="mt-2 text-sm text-success/90">
              Register and set your blood group, and you will start hearing about the requests you
              match.
            </p>
          </div>
        ) : (
          <div>
            <CircleAlert className="mx-auto size-10 text-warning" />
            <p className="mt-3 font-heading text-lg font-semibold text-warning">Not just yet</p>
            <ul className="mt-2.5 grid gap-1.5 text-left text-sm text-warning/90">
              {verdict.reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
            {verdict.nextEligible ? (
              <p className="mt-3 text-sm text-warning/90">
                Next eligible: <strong>{formatDate(verdict.nextEligible)}</strong>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
