import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  SpotCooldown,
  SpotGuesswork,
  SpotMatch,
  SpotRecord,
  SpotVerified,
} from "@/components/illustrations/spot";
import { Button } from "@/components/ui/button";
import { DONOR_ELIGIBILITY } from "@/lib/domain";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "A blood request on LifeLink is verified, matched against every compatible group, filtered by eligibility and distance, and recorded when the donation happens.",
};

const STEPS = [
  {
    art: SpotGuesswork,
    title: "A requester posts the need",
    body: "The patient's blood group, the hospital, how many units and the deadline. Nothing is visible to donors at this point — the request exists, but it has not been checked.",
    detail: "Status: awaiting review",
  },
  {
    art: SpotVerified,
    title: "An admin verifies it",
    body: "Someone reads the request and confirms it is real before a single donor hears about it. A request that cannot be confirmed is rejected with a reason the requester sees.",
    detail: "Status: verified, or rejected with a reason",
  },
  {
    art: SpotMatch,
    title: "Compatible donors are invited",
    body: "The patient's group expands into every group that can safely give to it. That list is then narrowed by who is available, who is past their cooldown, and who is close enough to come.",
    detail: "Status: matching",
  },
  {
    art: SpotCooldown,
    title: "A donor accepts",
    body: "Donors see only the requests they match. Accepting tells the requester to expect them; declining leaves the request open for someone else.",
    detail: "The donor's contact details stay private until they accept",
  },
  {
    art: SpotRecord,
    title: "The requester confirms the donation",
    body: "One transaction records the donation, updates how many units are still needed, starts the donor's cooldown and writes the audit trail. Either all of it happens or none of it does.",
    detail: "Status: fulfilled once every unit is covered",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="grain border-b bg-sidebar">
        <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            How a request reaches a donor
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Five steps, in this order. A request cannot skip verification, and a finished one
            cannot be quietly reopened — the state machine behind it has no edge back.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <ol className="grid gap-10">
          {STEPS.map((step, index) => (
            <li key={step.title} className="grid gap-5 sm:grid-cols-[7rem_1fr] sm:gap-8">
              <div className="w-24 sm:w-full">
                <step.art />
              </div>
              <div>
                <p className="font-mono text-xs text-primary">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{step.title}</h2>
                <p className="mt-2.5 leading-relaxed text-muted-foreground">{step.body}</p>
                <p className="mt-3 inline-flex rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-sidebar">
        <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Why the cooldown matters</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A donor needs {DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION} days between donations.
            LifeLink tracks that date for every donor, so someone who gave three weeks ago is never
            put in front of a request they cannot safely answer — and never has to say no to one.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Educational project logic, following common donation guidance. Not medical advice.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Ready to be on that list?</h2>
            <p className="mt-1.5 text-muted-foreground">
              Registering takes a minute. You will only hear about requests you match.
            </p>
          </div>
          <Button asChild size="lg" className="tap-target shrink-0">
            <Link href="/register">
              Register as a donor
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
