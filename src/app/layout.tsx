import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
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
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
