import type { Metadata } from "next";
import Link from "next/link";

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

      <div className="mt-8">
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
