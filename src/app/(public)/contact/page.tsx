import { AlertTriangle, Code2, Mail, Server } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about donating, posting a request, or a problem with the platform.",
};

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@lifelink.demo",
    href: "mailto:hello@lifelink.demo",
  },
  {
    icon: Code2,
    label: "Source code",
    value: "kira217-cyber/Life-Link-Frontend",
    href: "https://github.com/kira217-cyber/Life-Link-Frontend",
  },
  {
    icon: Server,
    label: "API status",
    value: "life-link-api.vercel.app/health",
    href: "https://life-link-api.vercel.app/health",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="grain border-b bg-sidebar">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Get in touch</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Questions about donating, posting a request, or something that looks broken — this is
            the place.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <ContactForm />

          <div className="grid gap-4 self-start">
            <div className="rounded-2xl border border-urgency-critical/30 bg-urgency-critical-soft p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-urgency-critical">
                <AlertTriangle className="size-4" />
                If a patient needs blood now
              </p>
              <p className="mt-2 text-sm leading-relaxed text-urgency-critical/90">
                Do not use this form. Post a request — it goes to an admin for review and then to
                every compatible donor nearby, which is far faster than an inbox.
              </p>
              <Link
                href="/register"
                className="mt-3 inline-block text-sm font-medium text-urgency-critical underline underline-offset-4"
              >
                Create a requester account
              </Link>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold">Other ways to reach us</h2>
              <ul className="mt-4 grid gap-4">
                {CHANNELS.map((channel) => (
                  <li key={channel.label} className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                      <channel.icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">{channel.label}</span>
                      <a
                        href={channel.href}
                        className="block truncate text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {channel.value}
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
