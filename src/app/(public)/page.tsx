import { ArrowRight, BadgeCheck, CalendarClock, HeartHandshake, MapPin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BLOOD_GROUP_LABEL, COMPATIBLE_DONORS, DONOR_ELIGIBILITY } from "@/lib/domain";
import type { BloodGroup } from "@/types/api";

const WORKFLOW = [
  {
    icon: HeartHandshake,
    title: "A request is posted",
    body: "The requester gives the patient's group, the hospital, how many units and by when. Nothing is visible to donors yet.",
  },
  {
    icon: BadgeCheck,
    title: "An admin verifies it",
    body: "Every request is reviewed before a single donor is contacted, so nobody is sent to a hospital that was never confirmed.",
  },
  {
    icon: MapPin,
    title: "Compatible donors are matched",
    body: "The patient's group expands into every group that can safely give to it, then eligibility and distance narrow the list.",
  },
  {
    icon: CalendarClock,
    title: "The donation is recorded",
    body: "The requester confirms it. One transaction updates the request, logs the donation and starts the donor's 90-day cooldown.",
  },
];

const FAILURES = [
  {
    heading: "Compatibility gets guessed",
    body: "People ask for the same group and miss the donors who could actually help. An A+ patient can receive from O−, O+, A− and A+.",
  },
  {
    heading: "Nobody checks who may donate",
    body: "Someone who gave blood three weeks ago should not be called again. No group chat tracks that; a cooldown rule does.",
  },
  {
    heading: "Requests go unverified",
    body: "An unmoderated post can send a dozen volunteers to a hospital nobody confirmed. Verification happens before contact, not after.",
  },
];

/** A readable slice of the full matrix — the eligibility page carries the rest. */
const PREVIEW_RECIPIENTS: BloodGroup[] = ["O_NEGATIVE", "A_POSITIVE", "B_POSITIVE", "AB_POSITIVE"];

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="border-b bg-gradient-to-b from-accent/40 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Verified requests · compatible donors · recorded donations
            </p>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              The right donor, not just the nearest post.
            </h1>

            <p className="mt-5 text-lg text-muted-foreground">
              When a patient needs blood, the search is still phone calls and Facebook groups.
              LifeLink turns it into a workflow: a request gets verified, matched against every
              compatible group, filtered by who is actually eligible to donate — and the donation
              is recorded when it happens.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Register as a donor
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/requests">Browse open requests</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Evaluating this project?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                One-click demo sign-in
              </Link>{" "}
              for all three roles.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- what goes wrong */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Three things an informal search gets wrong
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FAILURES.map((item) => (
            <Card key={item.heading} className="border-border/70">
              <CardContent>
                <h3 className="text-base font-semibold">{item.heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ how it works */}
      <section className="border-y bg-sidebar">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How a request reaches a donor
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Four steps, in this order. A request cannot skip verification, and a finished one
            cannot be reopened.
          </p>

          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((step, index) => (
              <li key={step.title}>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </div>
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------- compatibility */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Compatibility is a table, not a guess
            </h2>
            <p className="mt-3 text-muted-foreground">
              LifeLink expands a patient&apos;s blood group into every group that can safely give
              to it before it looks for anyone. O− can give to all eight; AB+ can receive from all
              eight.
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border bg-card p-4">
                <dt className="text-muted-foreground">Donation interval</dt>
                <dd className="mt-1 font-heading text-2xl font-semibold">
                  {DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION} days
                </dd>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <dt className="text-muted-foreground">Donor age</dt>
                <dd className="mt-1 font-heading text-2xl font-semibold">
                  {DONOR_ELIGIBILITY.MIN_AGE_YEARS}–{DONOR_ELIGIBILITY.MAX_AGE_YEARS}
                </dd>
              </div>
            </dl>

            <Button asChild variant="outline" className="mt-6">
              <Link href="/eligibility">
                See the full chart and check your eligibility
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="scroll-x rounded-xl border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Which donor blood groups each recipient group can receive from
              </caption>
              <thead>
                <tr className="border-b bg-muted/50">
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Patient
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Can receive from
                  </th>
                </tr>
              </thead>
              <tbody>
                {PREVIEW_RECIPIENTS.map((recipient) => (
                  <tr key={recipient} className="border-b last:border-0">
                    <th
                      scope="row"
                      className="px-4 py-3 text-left font-mono font-semibold text-primary"
                    >
                      {BLOOD_GROUP_LABEL[recipient]}
                    </th>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {COMPATIBLE_DONORS[recipient].map((donor) => (
                          <span
                            key={donor}
                            className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs"
                          >
                            {BLOOD_GROUP_LABEL[donor]}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">One donor, four lives a year.</h2>
            <p className="mt-2 max-w-xl text-primary-foreground/85">
              Register once, set your availability, and answer only the requests you are actually
              compatible with and eligible for.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="shrink-0">
            <Link href="/register">
              Join LifeLink
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
