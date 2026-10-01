"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { submitContact, type ContactField, type ContactState } from "@/app/actions/contact";
import { cn } from "@/lib/cn";
import { SmileArc } from "@/components/ui/SmileArc";

export interface InterestOption {
  value: string;
  label: string;
}

const ORDER: ContactField[] = ["name", "company", "email", "phone", "interest", "message", "consent"];
const INITIAL: ContactState = { status: "idle" };

const inputClass = (invalid: boolean) =>
  cn(
    "w-full rounded-[var(--radius-control)] border bg-paper px-4 text-[1rem] text-ink transition-colors duration-200 placeholder:text-teal-700/50 focus-visible:border-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25",
    invalid ? "border-danger" : "border-line hover:border-teal-900/30",
  );

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[0.9375rem] font-medium text-teal-900">
        {label}
        {required ? (
          <span className="text-teal-600" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-teal-700"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-small text-teal-700">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-small text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm({ interests }: { interests: InterestOption[] }) {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const errors = state.fieldErrors ?? {};
  const v = state.values ?? {};

  // After a failed submit, move focus to the first invalid field (or to the status message).
  useEffect(() => {
    if (state.status !== "error") return;
    const first = ORDER.find((f) => errors[f]);
    const el = first ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`) : null;
    (el ?? statusRef.current)?.focus();
  }, [state, errors]);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-6 rounded-[var(--radius-card)] bg-teal-900 p-8 text-teal-100 md:p-12">
        <SmileArc strokeWidth={3} className="w-12 text-lime" />
        <h2 className="text-h2 font-light text-paper">Thank you. Your message is on its way.</h2>
        <p className="max-w-lg text-body-l text-teal-200">
          One of our team will get back to you at the email address you gave us.
        </p>
      </div>
    );
  }

  const describedBy = (f: ContactField, hint = false) =>
    errors[f] ? `${f}-error` : hint ? `${f}-hint` : undefined;

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-6" aria-describedby="form-status">
      <p
        id="form-status"
        ref={statusRef}
        tabIndex={-1}
        role={state.status === "error" ? "alert" : undefined}
        className={cn("text-[0.9375rem] focus:outline-none", state.status === "error" ? "text-danger" : "sr-only")}
      >
        {state.status === "error" ? state.message : "All fields marked with an asterisk are required."}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Field id="name" label="Name" required error={errors.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            defaultValue={v.name}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
            aria-required
            className={cn(inputClass(!!errors.name), "h-12")}
          />
        </Field>
        <Field id="company" label="Company" required error={errors.company}>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            defaultValue={v.company}
            aria-invalid={!!errors.company}
            aria-describedby={describedBy("company")}
            aria-required
            className={cn(inputClass(!!errors.company), "h-12")}
          />
        </Field>
        <Field id="email" label="Work email" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@company.com"
            defaultValue={v.email}
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
            aria-required
            className={cn(inputClass(!!errors.email), "h-12")}
          />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+966 5x xxx xxxx"
            defaultValue={v.phone}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
            className={cn(inputClass(!!errors.phone), "h-12")}
          />
        </Field>
      </div>

      <Field id="interest" label="Area of interest" error={errors.interest}>
        <select
          id="interest"
          name="interest"
          defaultValue={v.interest ?? ""}
          aria-invalid={!!errors.interest}
          aria-describedby={describedBy("interest")}
          className={cn(inputClass(!!errors.interest), "h-12 appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10")}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%23083b3b' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
          }}
        >
          <option value="">Choose an area</option>
          {interests.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="message" label="How can we help?" required error={errors.message} hint="A few lines about where you are today and what you want to achieve.">
        <textarea
          id="message"
          name="message"
          rows={6}
          defaultValue={v.message}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message", true)}
          aria-required
          className={cn(inputClass(!!errors.message), "min-h-40 resize-y py-3")}
        />
      </Field>

      {/* Honeypot for bots: hidden from people and assistive technology */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] text-teal-900">
          <input
            name="consent"
            type="checkbox"
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("consent")}
            aria-required
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-[6px] border-line accent-teal-900"
          />
          <span>
            I agree to be contacted about my enquiry. <span className="text-teal-600" aria-hidden>*</span>
          </span>
        </label>
        {errors.consent ? (
          <p id="consent-error" className="text-small text-danger">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          aria-disabled={pending}
          className="inline-flex h-14 items-center gap-2 rounded-full bg-teal-900 px-7 text-base font-medium text-paper transition-colors duration-300 hover:bg-teal-800 disabled:cursor-progress disabled:opacity-70"
        >
          {pending ? "Sending…" : "Send message"}
          {!pending ? <span aria-hidden>→</span> : null}
        </button>
        <p className="text-small text-teal-700">Or email us at info@growdigital.com</p>
      </div>
    </form>
  );
}
