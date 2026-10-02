import type { Metadata } from "next";
import Link from "next/link";

import { GoogleButton } from "@/components/auth/google-button";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Join LifeLink as a donor to answer compatible requests, or as a requester to post one for a patient.",
};

export default function RegisterPage() {
  return (
    <div className="py-4">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Join LifeLink</h1>
        <p className="mt-2 text-muted-foreground">
          It takes a minute, and it is free — always.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        {/* Google has to be told which kind of account to open, and only the
            person signing up knows that — so the choice is made here rather
            than guessed and corrected later. */}
        <div className="grid gap-2.5">
          <p className="text-center text-xs text-muted-foreground">Continue with Google as</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <GoogleButton role="DONOR" label="A donor" />
            <GoogleButton role="REQUESTER" label="A requester" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or with your email</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <RegisterForm />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
