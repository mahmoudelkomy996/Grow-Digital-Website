"use client";

// next/link that prefixes internal hrefs with the current locale ("/about" → "/ar/about").
// Use it for every internal link; pass `locale` to link into another locale (the language switcher).
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { localizeHref, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/LocaleProvider";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string; locale?: Locale };

export function Link({ href, locale, ...rest }: Props) {
  const current = useLocale();
  return <NextLink href={localizeHref(locale ?? current, href)} {...rest} />;
}
