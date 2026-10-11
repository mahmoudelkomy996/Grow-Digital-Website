"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";
import { DICTIONARIES } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";

export type ContactField = "name" | "company" | "email" | "phone" | "interest" | "message" | "consent";

export interface ContactState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /** Submitted values, echoed back so the form keeps them after a failed submit */
  values?: Partial<Record<Exclude<ContactField, "consent">, string>>;
}

type Errors = (typeof DICTIONARIES)["en"]["contact"]["errors"];

const schemaFor = (e: Errors) =>
  z.object({
    name: z.string().trim().min(2, { error: e.name }).max(120),
    company: z.string().trim().min(2, { error: e.company }).max(160),
    email: z.string().trim().max(200).pipe(z.email({ error: e.email })),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine((v) => v === "" || /^[+()\d\s.-]{6,}$/.test(v), { error: e.phone }),
    interest: z.string().trim().max(80),
    message: z.string().trim().min(10, { error: e.message }).max(4000),
    consent: z.literal("on", { error: e.consent }),
  });

// Basic in-memory rate limit: 5 submissions per IP per 10 minutes (per server instance).
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const e = DICTIONARIES[locale].contact.errors;
  const FALLBACK = e.fallback;
  const raw = {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    interest: String(formData.get("interest") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
  const values = raw;

  // Honeypot: bots fill the hidden "website" field. Pretend success and drop the submission.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success" };
  }

  const parsed = schemaFor(e).safeParse({ ...raw, consent: formData.get("consent") ?? "" });
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ContactField;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: e.check, fieldErrors, values };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return { status: "error", message: e.rate, values };
  }

  const data = parsed.data;
  const text = [
    `Name: ${data.name}`,
    `Company: ${data.company}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "—"}`,
    `Area of interest: ${data.interest || "—"}`,
    `Language: ${locale}`,
    "",
    data.message,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (apiKey && to) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM || "Grow Digital Website <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()),
        replyTo: data.email,
        subject: `Website enquiry from ${data.name} (${data.company})`,
        text,
      });
      if (error) {
        console.error("Contact form: Resend error", error);
        return { status: "error", message: FALLBACK, values };
      }
      return { status: "success" };
    } catch (err) {
      console.error("Contact form: send failed", err);
      return { status: "error", message: FALLBACK, values };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("Contact form (development, email delivery not configured):\n" + text);
    return { status: "success" };
  }
  return { status: "error", message: FALLBACK, values };
}
