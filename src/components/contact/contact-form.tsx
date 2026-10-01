"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineLoader } from "@/components/ui/loader";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { emailSchema } from "@/lib/validation/auth";

const TOPICS = [
  { value: "donating", label: "Donating blood" },
  { value: "requesting", label: "Posting a request" },
  { value: "hospital", label: "Hospital or organisation partnership" },
  { value: "report", label: "Reporting a problem" },
  { value: "other", label: "Something else" },
];

const contactSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(80, "At most 80 characters"),
  email: emailSchema,
  topic: z.string().min(1, "Pick the closest one"),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters")
    .max(1500, "At most 1500 characters"),
});

type ContactValues = z.infer<typeof contactSchema>;

/**
 * The contact form.
 *
 * The API has no contact endpoint, and inventing one that silently discards
 * the message would be worse than saying so. The form validates properly and
 * then tells the truth about what happens next, with a real address to use
 * meanwhile — a fake "message sent" toast would be the dishonest option.
 */
export function ContactForm() {
  const [sent, setSent] = useState<ContactValues | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", topic: "", message: "" },
  });

  // useWatch rather than watch(): it subscribes through control, so the
  // compiler can memoise around it.
  const topic = useWatch({ control, name: "topic" });

  if (sent) {
    return (
      <div className="grid place-items-center rounded-2xl border border-success/40 bg-success-soft p-8 text-center">
        <CircleCheck className="size-10 text-success" />
        <h2 className="mt-4 font-heading text-lg font-semibold text-success">
          Your message is ready to send
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-success/90">
          This project has no mail service behind it yet, so nothing was transmitted. Copy what you
          wrote into an email to the address beside this form and it will reach us.
        </p>
        <Button variant="outline" className="mt-5 bg-card" onClick={() => setSent(null)}>
          Back to the form
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        // No network call: see the note above. The pause is the form settling,
        // not a request in flight, and the result says exactly that.
        setSent(values);
      })}
      noValidate
      className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} />
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
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="topic">What is it about?</Label>
        <Select value={topic} onValueChange={(value) => setValue("topic", value, { shouldValidate: true })}>
          <SelectTrigger id="topic">
            <SelectValue placeholder="Pick the closest one" />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.topic ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.topic.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Tell us what you need. If it is urgent and about a patient, post a request instead — it reaches donors far faster than this form."
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
        {errors.message ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="tap-target w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <InlineLoader label="Preparing" />
            Preparing…
          </>
        ) : (
          "Prepare my message"
        )}
      </Button>
    </form>
  );
}
