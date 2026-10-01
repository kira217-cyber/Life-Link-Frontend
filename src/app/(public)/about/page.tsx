import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HeroScene } from "@/components/illustrations/hero-scene";
import { SpotCooldown, SpotMatch, SpotVerified } from "@/components/illustrations/spot";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why LifeLink exists, the three failures it addresses, and what it deliberately does not do.",
};

const PRINCIPLES = [
  {
    art: SpotVerified,
    title: "Verify before you ask",
    body: "No donor is contacted about a request a person has not read and confirmed. It costs the platform a step; it saves a volunteer a wasted trip to a hospital that was never expecting them.",
  },
  {
    art: SpotMatch,
    title: "Compatibility is a table, not an opinion",
    body: "The mapping of which group can give to which is written out explicitly, not derived. A wrong transfusion mapping is the most dangerous bug this domain can have, and a table can be read straight across against a reference chart.",
  },
  {
    art: SpotCooldown,
    title: "Remember so people do not have to",
    body: "The date of someone's last donation decides whether they should be asked again. A group chat cannot hold that. A record can, and it means a donor is never put in the position of saying no.",
  },
];

const BOUNDARIES = [
  "LifeLink does not give medical advice. The eligibility rules follow common donation guidance and are not a clinical assessment.",
  "It does not hold or move blood. Hospitals do that; this connects the people on either side of the request.",
  "It does not publish donor contact details. A donor's number reaches a requester only after that donor accepts.",
  "It does not take payment for blood. The fund covers transport, tests and hospital costs — never the donation itself.",
];

export default function AboutPage() {
  return (
    <>
      <section className="grain border-b bg-sidebar">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Built for the hour when a phone tree is not fast enough
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Most blood searches still run on goodwill and group chats. Goodwill is not the
              bottleneck — record-keeping is. LifeLink is the record-keeping.
            </p>
          </div>
          <div className="mx-auto w-full max-w-xs lg:max-w-none">
            <HeroScene />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Three things we decided early
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <article key={principle.title} className="rounded-2xl border bg-card p-6">
              <div className="w-24">
                <principle.art />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {principle.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-sidebar">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">What LifeLink is not</h2>
          <p className="mt-3 text-muted-foreground">
            Being clear about the edges is part of being trustworthy inside them.
          </p>
          <ul className="mt-6 grid gap-3">
            {BOUNDARIES.map((boundary) => (
              <li key={boundary} className="flex gap-3 rounded-xl border bg-card p-4 text-sm">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="leading-relaxed text-muted-foreground">{boundary}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">About this project</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          LifeLink is a student project built for Programming Hero&apos;s Apollo Level 2 course. The
          API and this interface were written as two separate applications, and everything on this
          site is talking to a real deployed backend — there is no mock data anywhere in it.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Button asChild className="tap-target">
            <Link href="/how-it-works">
              See how it works
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="tap-target bg-card">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
