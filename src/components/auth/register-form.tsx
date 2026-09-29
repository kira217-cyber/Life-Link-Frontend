"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, Loader2, Stethoscope, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";

/** Admin is missing on purpose: the API only creates it from the seed. */
const ROLES = [
  {
    value: "DONOR" as const,
    label: "I want to donate",
    blurb: "Get matched to requests you are compatible with",
    icon: User,
  },
  {
    value: "REQUESTER" as const,
    label: "I need blood",
    blurb: "Post a request for a patient and track it",
    icon: Stethoscope,
  },
];

/** The rules the API enforces, shown live so nobody guesses at them. */
const PASSWORD_RULES = [
  { test: (value: string) => value.length >= 8, label: "8+ characters" },
  { test: (value: string) => /[a-z]/.test(value), label: "a lowercase letter" },
  { test: (value: string) => /[A-Z]/.test(value), label: "an uppercase letter" },
  { test: (value: string) => /\d/.test(value), label: "a number" },
];

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "DONOR",
      phone: "",
    },
  });

  // useWatch rather than watch(): it subscribes through the control object, so
  // the compiler can memoise around it.
  const password = useWatch({ control, name: "password" });

  function onSubmit(values: RegisterValues) {
    startTransition(async () => {
      const result = await registerAction(values);

      if (!result.ok) {
        for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
          if (path in values) setError(path as keyof RegisterValues, { message });
        }
        toast.error(result.message);
        return;
      }

      toast.success("Account created. Welcome to LifeLink.");
      router.push(result.redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
      <fieldset className="grid gap-2.5">
        <legend className="mb-2.5 text-sm font-medium">Why are you joining?</legend>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {ROLES.map((role) => {
                const selected = field.value === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => field.onChange(role.value)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      selected
                        ? "border-primary bg-accent"
                        : "bg-card hover:border-primary/40 hover:bg-muted/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <role.icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{role.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {role.blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Rahim Uddin"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">
          Phone <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+8801700000000"
          aria-invalid={Boolean(errors.phone)}
          {...register("phone")}
        />
        {errors.phone ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="pr-11"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5">
          {PASSWORD_RULES.map((rule) => {
            const met = rule.test(password ?? "");
            return (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors",
                  met ? "text-success" : "text-muted-foreground",
                )}
              >
                <Check className={cn("size-3.5", met ? "opacity-100" : "opacity-35")} />
                {rule.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Repeat password</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="tap-target mt-1 w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating your account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
