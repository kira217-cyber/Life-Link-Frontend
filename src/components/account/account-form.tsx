"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineLoader } from "@/components/ui/loader";
import { Label } from "@/components/ui/label";
import { browserFetch } from "@/lib/api/browser";
import { errorMessage, fieldErrorsOf } from "@/lib/api/errors";
import { ROLE_LABEL } from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { accountSchema, type AccountValues } from "@/lib/validation/profile";
import type { MeResponse } from "@/types/api";
import { UserAvatar } from "@/components/shared/user-avatar";

/**
 * Account settings.
 *
 * Only three fields, because those are the only three the API accepts here.
 * Email and role are shown but not editable — the endpoint strips them on
 * purpose, so offering an input that silently does nothing would be worse than
 * showing the value as read-only and saying why.
 */
export function AccountForm({ me }: { me: MeResponse }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    mode: "onTouched",
    defaultValues: {
      name: me.name,
      phone: me.phone ?? "",
      avatarUrl: me.avatarUrl ?? "",
    },
  });

  async function onSubmit(values: AccountValues) {
    setSaving(true);
    try {
      await browserFetch<MeResponse>("/users/me", {
        method: "PATCH",
        body: {
          name: values.name,
          // Empty means "clear it", which the API expresses as null rather
          // than an empty string.
          phone: values.phone?.trim() ? values.phone.trim() : null,
          avatarUrl: values.avatarUrl?.trim() ? values.avatarUrl.trim() : null,
        },
      });
      toast.success("Account updated.");
      router.refresh();
    } catch (error) {
      const fieldErrors = fieldErrorsOf(error);
      for (const fieldError of fieldErrors) {
        setError(fieldError.path as keyof AccountValues, { message: fieldError.message });
      }
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-4">
          <UserAvatar name={me.name} src={me.avatarUrl} size={56} />
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold">{me.name}</p>
            <p className="truncate text-sm text-muted-foreground">{me.email}</p>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
          {errors.name ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.name.message}
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
            placeholder="+8801700000000"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
          {errors.phone ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.phone.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Shared with a requester only after you accept one of their invitations.
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="avatarUrl">
            Avatar URL <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="avatarUrl"
            type="url"
            placeholder="https://…"
            aria-invalid={Boolean(errors.avatarUrl)}
            {...register("avatarUrl")}
          />
          {errors.avatarUrl ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.avatarUrl.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          className="tap-target w-full sm:w-auto"
          disabled={saving || !isDirty}
        >
          {saving ? (
            <>
              <InlineLoader label="Saving" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>

      <aside className="grid gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="size-4 text-muted-foreground" />
            Fixed for your safety
          </p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="mt-0.5 truncate">{me.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Role</dt>
              <dd className="mt-0.5">{ROLE_LABEL[me.role]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Signed in with</dt>
              <dd className="mt-0.5">{me.provider === "GOOGLE" ? "Google" : "Email and password"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Member since</dt>
              <dd className="mt-0.5">{formatDate(me.createdAt)}</dd>
            </div>
          </dl>
          <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
            The API refuses role and email changes through this endpoint by design — otherwise a
            stolen session could promote itself to admin.
          </p>
        </div>
      </aside>
    </div>
  );
}
