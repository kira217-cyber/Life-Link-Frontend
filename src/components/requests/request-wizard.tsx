"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { BloodGroupBadge, UrgencyBadge } from "@/components/shared/badges";
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
import { Textarea } from "@/components/ui/textarea";
import { browserFetch } from "@/lib/api/browser";
import { errorMessage } from "@/lib/api/errors";
import { BLOOD_GROUPS, BLOOD_GROUP_LABEL, COMPATIBLE_DONORS, URGENCY_OPTIONS } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  createRequestSchema,
  REQUEST_STEPS,
  type CreateRequestValues,
} from "@/lib/validation/request";
import type { BloodRequest } from "@/types/api";

/**
 * Posting a request, three steps at a time.
 *
 * One long form would be eleven fields on a phone, and a mistake in the first
 * would only surface after all eleven. Each step validates its own fields
 * before the next opens, so an error is caught beside the input that caused
 * it, while it is still the thing being thought about.
 *
 * The whole form stays mounted — only the visible step changes — so going back
 * never loses what was typed.
 */
export function RequestWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateRequestValues>({
    resolver: zodResolver(createRequestSchema),
    mode: "onTouched",
    defaultValues: {
      patientName: "",
      bloodGroup: "O_POSITIVE",
      unitsNeeded: 1,
      reason: "",
      hospitalName: "",
      hospitalAddress: "",
      district: "",
      city: "",
      neededAt: "",
      urgency: "NORMAL",
      contactPhone: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = form;

  const step = REQUEST_STEPS[stepIndex]!;
  const isLast = stepIndex === REQUEST_STEPS.length - 1;

  async function next() {
    // Only this step's fields — asking for the rest would flag inputs the
    // person has not reached yet.
    const valid = await trigger([...step.fields], { shouldFocus: true });
    if (valid) setStepIndex((index) => Math.min(index + 1, REQUEST_STEPS.length - 1));
  }

  async function onSubmit(values: CreateRequestValues) {
    setSubmitting(true);
    try {
      const created = await browserFetch<BloodRequest>("/blood-requests", {
        method: "POST",
        body: {
          ...values,
          reason: values.reason?.trim() ? values.reason.trim() : undefined,
          // The input gives a local date; the API wants an instant.
          neededAt: new Date(values.neededAt).toISOString(),
        },
      });

      toast.success("Request submitted. An admin will review it before any donor is contacted.");
      router.push(`/requester?highlight=${created.id}`);
      router.refresh();
    } catch (error) {
      // Field errors from the API belong beside their input — and may be on a
      // step that is no longer visible, so jump back to it.
      const fieldErrors =
        error && typeof error === "object" && "fieldErrors" in error
          ? (error as { fieldErrors: Array<{ path: string; message: string }> }).fieldErrors
          : [];

      // Typed wide on purpose: REQUEST_STEPS is `as const`, so its length is
      // the literal 3 and the assignment below would not fit.
      let earliest: number = REQUEST_STEPS.length;
      for (const fieldError of fieldErrors) {
        const key = fieldError.path as keyof CreateRequestValues;
        if (key in getValues()) {
          setError(key, { message: fieldError.message });
          const owner = REQUEST_STEPS.findIndex((candidate) =>
            (candidate.fields as readonly string[]).includes(key),
          );
          if (owner !== -1) earliest = Math.min(earliest, owner);
        }
      }
      if (earliest < REQUEST_STEPS.length) setStepIndex(earliest);

      toast.error(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const values = getValues();
  const compatible = COMPATIBLE_DONORS[values.bloodGroup] ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
      {/* ------------------------------------------------------- progress */}
      <ol className="grid gap-2 sm:grid-cols-3">
        {REQUEST_STEPS.map((candidate, index) => {
          const done = index < stepIndex;
          const current = index === stepIndex;
          return (
            <li key={candidate.id}>
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
                  current && "border-primary bg-accent",
                  done && "bg-card",
                  !current && !done && "bg-card/60",
                )}
                aria-current={current ? "step" : undefined}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    done && "bg-success text-background",
                    current && "bg-primary text-primary-foreground",
                    !current && !done && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{candidate.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {candidate.blurb}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        {/* ------------------------------------------------------ patient */}
        <div className={cn("grid gap-5", stepIndex !== 0 && "hidden")}>
          <div className="grid gap-2">
            <Label htmlFor="patientName">Patient name</Label>
            <Input
              id="patientName"
              placeholder="Ayesha Siddika"
              aria-invalid={Boolean(errors.patientName)}
              {...register("patientName")}
            />
            {errors.patientName ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.patientName.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bloodGroup">Blood group needed</Label>
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
              <Label htmlFor="unitsNeeded">Units needed</Label>
              <Input
                id="unitsNeeded"
                type="number"
                min={1}
                max={10}
                aria-invalid={Boolean(errors.unitsNeeded)}
                {...register("unitsNeeded")}
              />
              {errors.unitsNeeded ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.unitsNeeded.message}
                </p>
              ) : null}
            </div>
          </div>

          {/* The one piece of domain knowledge worth surfacing while the group
              is still being chosen. */}
          <div className="rounded-xl border bg-muted/50 p-4">
            <p className="text-sm font-medium">
              This patient can receive from {compatible.length} of 8 groups
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {compatible.map((donor) => (
                <span
                  key={donor}
                  className="rounded-md border bg-card px-2 py-0.5 font-mono text-xs font-medium"
                >
                  {BLOOD_GROUP_LABEL[donor]}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              LifeLink invites all of them, not only an exact match.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">
              Reason <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="reason"
              rows={3}
              placeholder="For example: post-surgery transfusion"
              {...register("reason")}
            />
          </div>
        </div>

        {/* ----------------------------------------------------- hospital */}
        <div className={cn("grid gap-5", stepIndex !== 1 && "hidden")}>
          <div className="grid gap-2">
            <Label htmlFor="hospitalName">Hospital</Label>
            <Input
              id="hospitalName"
              placeholder="Shefa General Hospital"
              aria-invalid={Boolean(errors.hospitalName)}
              {...register("hospitalName")}
            />
            {errors.hospitalName ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.hospitalName.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hospitalAddress">Address</Label>
            <Input
              id="hospitalAddress"
              placeholder="Bakshi Bazar Road, Dhaka 1211"
              aria-invalid={Boolean(errors.hospitalAddress)}
              {...register("hospitalAddress")}
            />
            {errors.hospitalAddress ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.hospitalAddress.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Dhaka"
                aria-invalid={Boolean(errors.city)}
                {...register("city")}
              />
              {errors.city ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.city.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="Dhaka"
                aria-invalid={Boolean(errors.district)}
                {...register("district")}
              />
              {errors.district ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.district.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- timing */}
        <div className={cn("grid gap-5", stepIndex !== 2 && "hidden")}>
          <div className="grid gap-2">
            <Label htmlFor="neededAt">Needed by</Label>
            <Input
              id="neededAt"
              type="datetime-local"
              aria-invalid={Boolean(errors.neededAt)}
              {...register("neededAt")}
            />
            {errors.neededAt ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.neededAt.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                A request past its deadline stops accepting donors.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="urgency">Urgency</Label>
            <Controller
              control={control}
              name="urgency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contactPhone">Contact number</Label>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="+8801712345678"
              aria-invalid={Boolean(errors.contactPhone)}
              {...register("contactPhone")}
            />
            {errors.contactPhone ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.contactPhone.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Shown to donors who accept, so they can reach you at the hospital.
              </p>
            )}
          </div>

          {/* A last look before it goes to review. */}
          <div className="rounded-xl border bg-muted/50 p-4">
            <p className="text-sm font-semibold">Before you submit</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <BloodGroupBadge value={values.bloodGroup} size="sm" />
              <UrgencyBadge value={values.urgency} />
            </div>
            <dl className="mt-3 grid gap-1 text-sm text-muted-foreground">
              <dd>
                <span className="text-foreground">{values.patientName || "Patient"}</span> ·{" "}
                {values.unitsNeeded} unit{values.unitsNeeded === 1 ? "" : "s"}
              </dd>
              <dd>{values.hospitalName || "Hospital"}</dd>
              <dd>
                {values.city || "City"}
                {values.neededAt ? ` · by ${formatDate(values.neededAt)}` : ""}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- footer */}
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="tap-target bg-card"
          disabled={stepIndex === 0 || submitting}
          onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {isLast ? (
          <Button type="submit" className="tap-target" disabled={submitting}>
            {submitting ? (
              <>
                <InlineLoader label="Submitting" />
                Submitting…
              </>
            ) : (
              "Submit for review"
            )}
          </Button>
        ) : (
          <Button type="button" className="tap-target" onClick={next}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
