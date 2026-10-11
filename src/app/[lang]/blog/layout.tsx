import { notFound } from "next/navigation";
import { BLOG_LOCALES, isLocale } from "@/i18n/config";

// The blog is English-only for now (see BLOG_LOCALES); the proxy redirects /ar/blog/… to /blog/….
export default async function BlogLayout({ children, params }: LayoutProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLocale(lang) || !BLOG_LOCALES.includes(lang)) notFound();
  return children;
}
