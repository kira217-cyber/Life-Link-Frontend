"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineLoader } from "@/components/ui/loader";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { browserFetch } from "@/lib/api/browser";
import { errorMessage } from "@/lib/api/errors";
import { PAYMENT_LIMITS } from "@/lib/domain";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import type { CheckoutSession } from "@/types/api";

/** Preset amounts in the smallest unit, as the API expects them. */
const PRESETS = [500, 1000, 2500, 5000];

const donateSchema = z.object({
  // Entered in whole currency units, converted on submit — the API is given
  // cents, and doing that conversion in one place stops a stray float.
  amountMajor: z.coerce
    .number()
    .min(PAYMENT_LIMITS.MIN_AMOUNT / 100, `Minimum is ${formatMoney(PAYMENT_LIMITS.MIN_AMOUNT)}`)
    .max(PAYMENT_LIMITS.MAX_AMOUNT / 100, `Maximum is ${formatMoney(PAYMENT_LIMITS.MAX_AMOUNT)}`),
  purpose: z.enum(["PLATFORM_DONATION", "EMERGENCY_FUND"]),
  note: z.string().trim().max(200, "At most 200 characters").optional().or(z.literal("")),
});

type DonateValues = z.infer<typeof donateSchema>;

const PURPOSES = [
  {
    value: "EMERGENCY_FUND" as const,
    label: "Emergency assistance fund",
    blurb: "Transport, tests and hospital costs for patients who cannot cover them",
  },
  {
    value: "PLATFORM_DONATION" as const,
    label: "Keep LifeLink running",
    blurb: "Hosting, messaging and the work of verifying every request",
  },
];

/**
 * Starts a Stripe Checkout session and hands the browser over to Stripe.
 *
 * No card details are ever typed here — the form collects an amount and a
 * purpose, the API creates the session, and Stripe hosts the payment page.
 * That is the whole reason to use Checkout rather than a card field: this
 * application never sees a card number, so it never has to protect one.
 */
export function DonateForm() {
  const [redirecting, setRedirecting] = useState(false);
  const startBlocking = useUiStore((state) => state.startBlocking);
  const stopBlocking = useUiStore((state) => state.stopBlocking);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DonateValues>({
    resolver: zodResolver(donateSchema),
    mode: "onTouched",
    defaultValues: { amountMajor: 10, purpose: "EMERGENCY_FUND", note: "" },
  });

  async function onSubmit(values: DonateValues) {
    setRedirecting(true);
    startBlocking({
      title: "Opening secure checkout",
      description: "Stripe handles the card details — LifeLink never sees them.",
    });

    try {
      const session = await browserFetch<CheckoutSession>("/payments/checkout-session", {
        method: "POST",
        body: {
          amount: Math.round(values.amountMajor * 100),
          purpose: values.purpose,
          ...(values.note?.trim() ? { note: values.note.trim() } : {}),
        },
      });

      // A full navigation, not a router push: the destination is Stripe's.
      // assign() rather than setting .href — the compiler reads the assignment
      // as mutating a value it is tracking.
      window.location.assign(session.checkoutUrl);
    } catch (error) {
      stopBlocking();
      setRedirecting(false);
      toast.error(errorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
      <fieldset className="grid gap-2.5">
        <legend className="mb-2.5 text-sm font-medium">What is it for?</legend>
        <Controller
          control={control}
          name="purpose"
          render={({ field }) => (
            <div className="grid gap-2.5">
              {PURPOSES.map((purpose) => {
                const selected = field.value === purpose.value;
                return (
                  <button
                    key={purpose.value}
                    type="button"
                    onClick={() => field.onChange(purpose.value)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      selected ? "border-primary bg-accent" : "bg-card hover:border-primary/40",
                    )}
                  >
                    <span className="block text-sm font-semibold">{purpose.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {purpose.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </fieldset>

      <div className="grid gap-3">
        <Label htmlFor="amountMajor">Amount (USD)</Label>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="sm"
              className="bg-card"
              onClick={() => setValue("amountMajor", preset / 100, { shouldValidate: true })}
            >
              {formatMoney(preset)}
            </Button>
          ))}
        </div>

        <Input
          id="amountMajor"
          type="number"
          min={PAYMENT_LIMITS.MIN_AMOUNT / 100}
          max={PAYMENT_LIMITS.MAX_AMOUNT / 100}
          step="0.01"
          aria-invalid={Boolean(errors.amountMajor)}
          {...register("amountMajor")}
        />
        {errors.amountMajor ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.amountMajor.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Between {formatMoney(PAYMENT_LIMITS.MIN_AMOUNT)} and{" "}
            {formatMoney(PAYMENT_LIMITS.MAX_AMOUNT)}. The server checks this again.
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="note" rows={2} placeholder="In memory of…" {...register("note")} />
      </div>

      <div className="rounded-xl border bg-muted/50 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="size-4 text-success" />
          Card details go to Stripe, never to LifeLink
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          You will be taken to Stripe&apos;s hosted checkout. Your payment is only marked paid once
          Stripe confirms it with a signed webhook — not when you land back here.
        </p>
      </div>

      <Button type="submit" size="lg" className="tap-target w-full" disabled={redirecting}>
        {redirecting ? (
          <>
            <InlineLoader label="Opening checkout" />
            Opening checkout…
          </>
        ) : (
          <>
            Continue to secure checkout
            <ExternalLink className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
