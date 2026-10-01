"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { BloodGroupBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineLoader } from "@/components/ui/loader";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { browserFetch } from "@/lib/api/browser";
import { errorMessage, fieldErrorsOf } from "@/lib/api/errors";
import { BLOOD_GROUPS, BLOOD_GROUP_LABEL, canDonateTo } from "@/lib/domain";
import { cn } from "@/lib/utils";
import {
  donorProfileSchema,
  ELIGIBILITY_HINTS,
  GENDER_OPTIONS,
  type DonorProfileValues,
} from "@/lib/validation/profile";
import type { DonorProfile, EligibilityResult } from "@/types/api";

/** An ISO instant from the API, as the date input wants it. */
function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/**
 * The donor profile.
 *
 * This is the record matching runs on, which is why the page says so: blood
 * group, city and the date of the last donation are not account decoration,
 * they decide whether an invitation ever reaches this person.
 *
 * Availability sits in the same form rather than behind a separate toggle
 * elsewhere — it is the one rule a donor controls directly, and splitting it
 * off would hide that.
 */
export function DonorProfileForm({
  profile,
  eligibility,
}: {
  profile: DonorProfile | null;
  eligibility: EligibilityResult | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DonorProfileValues>({
    resolver: zodResolver(donorProfileSchema),
    mode: "onTouched",
    defaultValues: {
      bloodGroup: profile?.bloodGroup ?? "O_POSITIVE",
      dateOfBirth: toDateInput(profile?.dateOfBirth),
      gender: profile?.gender ?? "UNDISCLOSED",
      weightKg: profile?.weightKg ?? "",
      district: profile?.district ?? "",
      city: profile?.city ?? "",
      address: profile?.address ?? "",
      lastDonationAt: toDateInput(profile?.lastDonationAt),
      isAvailable: profile?.isAvailable ?? true,
    },
  });

  // useWatch rather than watch(): it subscribes through control, which the
  // compiler can memoise around.
  const bloodGroup = useWatch({ control, name: "bloodGroup" });

  async function onSubmit(values: DonorProfileValues) {
    setSaving(true);
    try {
      await browserFetch<DonorProfile>("/donors/me/profile", {
        method: "PUT",
        body: {
          bloodGroup: values.bloodGroup,
          dateOfBirth: new Date(values.dateOfBirth).toISOString(),
          gender: values.gender,
          district: values.district,
          city: values.city,
          isAvailable: values.isAvailable,
          ...(values.weightKg !== "" && values.weightKg !== undefined
            ? { weightKg: Number(values.weightKg) }
            : {}),
          ...(values.address ? { address: values.address } : {}),
          ...(values.lastDonationAt
            ? { lastDonationAt: new Date(values.lastDonationAt).toISOString() }
            : {}),
        },
      });

      toast.success("Profile saved. Matching will use these details from now on.");
      router.refresh();
    } catch (error) {
      const fieldErrors = fieldErrorsOf(error);
      for (const fieldError of fieldErrors) {
        const key = fieldError.path as keyof DonorProfileValues;
        setError(key, { message: fieldError.message });
      }
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const recipients = canDonateTo(bloodGroup);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="bloodGroup">Blood group</Label>
            <Controller
              control={control}
              name="bloodGroup"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="bloodGroup">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {BLOOD_GROUP_LABEL[group]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="dateOfBirth">Date of birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              aria-invalid={Boolean(errors.dateOfBirth)}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.dateOfBirth.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Donors are {ELIGIBILITY_HINTS.age}.</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="weightKg">
              Weight in kg <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="weightKg"
              type="number"
              min={30}
              max={300}
              aria-invalid={Boolean(errors.weightKg)}
              {...register("weightKg")}
            />
            {errors.weightKg ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.weightKg.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Only checked if given — {ELIGIBILITY_HINTS.weight}.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" aria-invalid={Boolean(errors.city)} {...register("city")} />
            {errors.city ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.city.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="district">District</Label>
            <Input id="district" aria-invalid={Boolean(errors.district)} {...register("district")} />
            {errors.district ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.district.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">
            Address <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="address" aria-invalid={Boolean(errors.address)} {...register("address")} />
          <p className="text-xs text-muted-foreground">
            Only ever shown to you and to an admin — never in the donor directory.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lastDonationAt">
            Last donation <span className="font-normal text-muted-foreground">(if any)</span>
          </Label>
          <Input
            id="lastDonationAt"
            type="date"
            aria-invalid={Boolean(errors.lastDonationAt)}
            {...register("lastDonationAt")}
          />
          {errors.lastDonationAt ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.lastDonationAt.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Starts your cooldown — {ELIGIBILITY_HINTS.cooldown}.
            </p>
          )}
        </div>

        <Controller
          control={control}
          name="isAvailable"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
              <div className="min-w-0">
                <Label htmlFor="isAvailable" className="cursor-pointer">
                  Available to donate
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Turn this off and you drop out of matching entirely until you turn it back on.
                </p>
              </div>
              <Switch id="isAvailable" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />

        <Button type="submit" size="lg" className="tap-target w-full sm:w-auto" disabled={saving}>
          {saving ? (
            <>
              <InlineLoader label="Saving" />
              Saving…
            </>
          ) : profile ? (
            "Save changes"
          ) : (
            "Create my donor profile"
          )}
        </Button>
      </form>

      <aside className="grid gap-4">
        <div
          className={cn(
            "rounded-2xl border p-5",
            eligibility?.eligible
              ? "border-success/40 bg-success-soft"
              : eligibility
                ? "border-warning/40 bg-warning-soft"
                : "border-dashed bg-card",
          )}
        >
          {eligibility ? (
            <>
              <p
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  eligibility.eligible ? "text-success" : "text-warning",
                )}
              >
                {eligibility.eligible ? (
                  <CircleCheck className="size-4" />
                ) : (
                  <CircleAlert className="size-4" />
                )}
                {eligibility.eligible ? "Eligible to donate" : "Not eligible right now"}
              </p>
              {eligibility.reasons.length > 0 ? (
                <ul className="mt-2.5 grid gap-1.5 text-sm text-warning/90">
                  {eligibility.reasons.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-success/90">
                  You will appear in matching for every compatible request near you.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Save your profile and the API will tell you where you stand.
            </p>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold">Who you can help</p>
          <div className="mt-3 flex items-center gap-3">
            <BloodGroupBadge value={bloodGroup} />
            <p className="text-sm text-muted-foreground">
              can give to {recipients.length} of 8 groups
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipients.map((recipient) => (
              <span
                key={recipient}
                className="rounded-md border bg-secondary px-2 py-0.5 font-mono text-xs font-medium"
              >
                {BLOOD_GROUP_LABEL[recipient]}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
