import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { AuthArt } from "@/components/illustrations/auth-art";
import { ThemeToggle } from "@/components/theme-toggle";

const POINTS = [
  { icon: ShieldCheck, text: "Every request is reviewed before a donor is contacted" },
  { icon: HeartHandshake, text: "You only hear about requests you can actually answer" },
  { icon: Sparkles, text: "Your cooldown and eligibility are tracked for you" },
];

/**
 * Two panes on desktop, one on mobile. The art panel is decorative, so it is
 * dropped below `lg` rather than shrunk — a phone should get the form, not a
 * picture pushing it off the fold.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Logo href="/" className="text-primary-foreground [&_span]:text-primary-foreground" />

        <div className="mx-auto w-full max-w-sm py-8">
          <AuthArt />
        </div>

        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            A request, verified. A donor, matched.
          </h2>
          <ul className="mt-5 space-y-3">
            {POINTS.map((point) => (
              <li key={point.text} className="flex items-start gap-3 text-sm">
                <point.icon className="mt-0.5 size-4 shrink-0 text-primary-foreground/80" />
                <span className="text-primary-foreground/90">{point.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:justify-end">
          <span className="lg:hidden">
            <Logo href="/" />
          </span>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 pb-14 sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
