import { ArrowRight, Check, Clock3, HeartHandshake, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { HeroScene } from "@/components/illustrations/hero-scene";
import {
  SpotCooldown,
  SpotGuesswork,
  SpotMatch,
  SpotRecord,
  SpotVerified,
} from "@/components/illustrations/spot";
import { Button } from "@/components/ui/button";
import { BLOOD_GROUP_LABEL, COMPATIBLE_DONORS, DONOR_ELIGIBILITY } from "@/lib/domain";
import type { BloodGroup } from "@/types/api";

const FAILURES = [
  {
    art: SpotGuesswork,
    heading: "Compatibility gets guessed",
    body: "People ask for the same group and miss the donors who could actually help. An A+ patient can receive from four different groups, not one.",
  },
  {
    art: SpotCooldown,
    heading: "Nobody tracks who may donate",
    body: "Someone who gave blood three weeks ago should not be called again. A group chat cannot remember that. A cooldown rule can.",
  },
  {
    art: SpotVerified,
    heading: "Requests go unverified",
    body: "An unmoderated post can send a dozen volunteers to a hospital nobody confirmed. Here, verification happens before anyone is contacted.",
  },
];

const WORKFLOW = [
  {
    art: SpotGuesswork,
    title: "A request is posted",
    body: "Patient group, hospital, units needed and the deadline. Nothing is visible to donors yet.",
  },
  {
    art: SpotVerified,
    title: "An admin verifies it",
    body: "Reviewed before a single donor is contacted, so nobody is sent somewhere that was never confirmed.",
  },
  {
    art: SpotMatch,
    title: "Compatible donors are matched",
    body: "The group expands into every group that can safely give to it, then eligibility and distance narrow the list.",
  },
  {
    art: SpotRecord,
    title: "The donation is recorded",
    body: "One transaction updates the request, logs the donation and starts the donor's cooldown.",
  },
];

const PROMISES = [
  { icon: ShieldCheck, label: "Every request reviewed before contact" },
  { icon: Clock3, label: "Cooldown tracked automatically" },
  { icon: HeartHandshake, label: "You only see requests you match" },
];

const PREVIEW_RECIPIENTS: BloodGroup[] = ["O_NEGATIVE", "A_POSITIVE", "B_POSITIVE", "AB_POSITIVE"];

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="grain border-b bg-sidebar">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              Verified requests · compatible donors · recorded donations
            </p>

            <h1 className="mt-5 text-[2.1rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              The right donor, not just the nearest post.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              When a patient needs blood, the search is still phone calls and Facebook groups.
              LifeLink turns it into a workflow — verified, matched against every compatible
              group, filtered to donors who are actually eligible today.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="tap-target w-full sm:w-auto">
                <Link href="/register">
                  Register as a donor
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="tap-target w-full bg-card sm:w-auto"
              >
                <Link href="/requests">Browse open requests</Link>
              </Button>
            </div>

            <ul className="mt-8 grid gap-2.5">
              {PROMISES.map((promise) => (
                <li key={promise.label} className="flex items-center gap-2.5 text-sm">
                  <promise.icon className="size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{promise.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-first mx-auto w-full max-w-sm lg:order-none lg:max-w-none">
            <HeroScene />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- what goes wrong */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Three things an informal search gets wrong
          </h2>
          <p className="mt-3 text-muted-foreground">
            None of these are failures of goodwill. They are failures of record-keeping — which
            is exactly what software is for.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FAILURES.map((item) => (
            <article
              key={item.heading}
              className="rounded-2xl border bg-card p-6 transition-shadow hover:shadow-sm"
            >
              <div className="mx-auto w-28 sm:mx-0">
                <item.art />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{item.heading}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ how it works */}
      <section className="grain border-y bg-sidebar">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              How a request reaches a donor
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four steps, in this order. A request cannot skip verification, and a finished one
              cannot be quietly reopened.
            </p>
          </div>

          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((step, index) => (
              <li key={step.title} className="flex gap-4 sm:block">
                <div className="w-16 shrink-0 sm:w-24">
                  <step.art />
                </div>
                <div className="sm:mt-4">
                  <p className="font-mono text-xs text-primary">
                    Step {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------- compatibility */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Compatibility is a table, not a guess
            </h2>
            <p className="mt-3 text-muted-foreground">
              Before LifeLink looks for anyone, it expands the patient&apos;s blood group into
              every group that can safely give to it. O− can give to all eight. AB+ can receive
              from all eight.
            </p>

            <dl className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl border bg-card p-4">
                <dt className="text-sm text-muted-foreground">Between donations</dt>
                <dd className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
                  {DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION}
                  <span className="ml-1 text-base font-normal text-muted-foreground">days</span>
                </dd>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <dt className="text-sm text-muted-foreground">Donor age</dt>
                <dd className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
                  {DONOR_ELIGIBILITY.MIN_AGE_YEARS}–{DONOR_ELIGIBILITY.MAX_AGE_YEARS}
                </dd>
              </div>
            </dl>

            <Button asChild variant="outline" className="tap-target mt-6 w-full bg-card sm:w-auto">
              <Link href="/eligibility">
                Check whether you can donate
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="scroll-x">
              <table className="w-full min-w-[22rem] text-sm">
                <caption className="sr-only">
                  Which donor blood groups each recipient group can receive from
                </caption>
                <thead>
                  <tr className="border-b bg-muted/60">
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
                        className="px-4 py-3.5 text-left font-mono text-base font-semibold text-primary"
                      >
                        {BLOOD_GROUP_LABEL[recipient]}
                      </th>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {COMPATIBLE_DONORS[recipient].map((donor) => (
                            <span
                              key={donor}
                              className="rounded-md border bg-secondary px-2 py-0.5 font-mono text-xs font-medium"
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
            <p className="border-t bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
              Four of eight groups shown. Educational project — not medical advice.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-14 sm:px-6 sm:py-16 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              One donor, up to four lives a year.
            </h2>
            <p className="mt-3 text-primary-foreground/85">
              Register once, set your availability, and only hear about the requests you are
              actually compatible with and eligible for.
            </p>
            <ul className="mt-5 grid gap-2 text-sm text-primary-foreground/90 sm:grid-cols-2">
              {["Free, always", "No spam — matched requests only"].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <Button asChild size="lg" variant="secondary" className="tap-target w-full shrink-0 md:w-auto">
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
