import { ArrowRight, CalendarClock, Scale, UserCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EligibilityChecker } from "@/components/eligibility/eligibility-checker";
import { Button } from "@/components/ui/button";
import {
  BLOOD_GROUPS,
  BLOOD_GROUP_LABEL,
  canDonateTo,
  COMPATIBLE_DONORS,
  DONOR_ELIGIBILITY,
} from "@/lib/domain";

export const metadata: Metadata = {
  title: "Can I donate?",
  description:
    "The full blood compatibility chart, the eligibility rules LifeLink applies, and a quick check against them.",
};

const RULES = [
  {
    icon: UserCheck,
    title: `Aged ${DONOR_ELIGIBILITY.MIN_AGE_YEARS} to ${DONOR_ELIGIBILITY.MAX_AGE_YEARS}`,
    body: "Checked from your date of birth on the day a request is matched, not on the day you registered.",
  },
  {
    icon: CalendarClock,
    title: `${DONOR_ELIGIBILITY.MIN_DAYS_SINCE_LAST_DONATION} days since your last donation`,
    body: "Tracked for you. You will not be shown a request you are still in cooldown for.",
  },
  {
    icon: Scale,
    title: `At least ${DONOR_ELIGIBILITY.MIN_WEIGHT_KG} kg`,
    body: "Only checked if you have recorded a weight — an unknown weight is not treated as a failure.",
  },
];

export default function EligibilityPage() {
  return (
    <>
      <section className="grain border-b bg-sidebar">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Can I donate?</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Two questions decide it: can your blood go to this patient, and are you eligible to
            give today. Both are below — the second one you can check right now.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ checker */}
      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Check your eligibility</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Nothing here is sent anywhere — it runs in your browser against the same rules the API
          applies.
        </p>
        <div className="mt-6">
          <EligibilityChecker />
        </div>
      </section>

      {/* -------------------------------------------------------------- rules */}
      <section className="border-y bg-sidebar">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">The rules LifeLink applies</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {RULES.map((rule) => (
              <div key={rule.title} className="rounded-2xl border bg-card p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <rule.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{rule.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Your availability switch is the fourth rule, and the only one you control directly —
            turn it off and you drop out of matching until you turn it back on.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- chart */}
      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">The full compatibility chart</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          O− is the universal donor; AB+ the universal recipient. LifeLink expands a patient&apos;s
          group into every compatible one before it looks for anybody.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <div className="scroll-x">
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">
                For each blood group: who they can receive from, and who they can give to
              </caption>
              <thead>
                <tr className="border-b bg-muted/60 text-left">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Group
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Can receive from
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Can give to
                  </th>
                </tr>
              </thead>
              <tbody>
                {BLOOD_GROUPS.map((group) => (
                  <tr key={group} className="border-b last:border-0">
                    <th
                      scope="row"
                      className="px-4 py-3.5 text-left font-mono text-base font-semibold text-primary"
                    >
                      {BLOOD_GROUP_LABEL[group]}
                    </th>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {COMPATIBLE_DONORS[group].map((donor) => (
                          <span
                            key={donor}
                            className="rounded-md border bg-secondary px-2 py-0.5 font-mono text-xs font-medium"
                          >
                            {BLOOD_GROUP_LABEL[donor]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {canDonateTo(group).map((recipient) => (
                          <span
                            key={recipient}
                            className="rounded-md border bg-secondary px-2 py-0.5 font-mono text-xs font-medium"
                          >
                            {BLOOD_GROUP_LABEL[recipient]}
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
            Red cells only. Educational project — not medical advice.
          </p>
        </div>
      </section>

      <section className="border-t bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Eligible? Join the list.</h2>
            <p className="mt-2 text-primary-foreground/85">
              Set your group and area once. We will only contact you about requests you match.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="tap-target shrink-0">
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
