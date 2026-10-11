// Server-side locale access. The locale is the [lang] root param, read with next/root-params, so any
// Server Component can call these without prop drilling. (Not usable in Client Components or Route Handlers.)
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { getContent as contentFor, type Content } from "@/content";
import { isLocale, type Locale } from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const l = await lang();
  if (!isLocale(l)) notFound();
  return l;
}

export async function getContent(): Promise<Content> {
  return contentFor(await getLocale());
}

export async function getDict(): Promise<Dictionary> {
  return DICTIONARIES[await getLocale()];
}

/** Locale, content and UI dictionary in one call. */
export async function getI18n(): Promise<{ locale: Locale; c: Content; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, c: contentFor(locale), t: DICTIONARIES[locale] };
}
