import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://growdigital.com"),
  title: {
    default: "Grow Digital — The agile integrator",
    template: "%s · Grow Digital",
  },
  description:
    "Grow Digital is a business integrator for enterprises in KSA and the UAE: one accountable team to consult, transform, build, operate, secure and grow.",
};

export const viewport: Viewport = {
  themeColor: "#083b3b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-paper text-ink">
        <a
          href="#main"
          className="fixed top-3 left-3 z-[100] -translate-y-[150%] rounded-full bg-lime px-5 py-3 text-[0.9375rem] font-medium text-teal-950 transition-transform duration-300 focus-visible:translate-y-0 focus-visible:outline-teal-950"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
