import { notFound } from "next/navigation";

// Any unknown URL inside a locale renders that locale's not-found page (inside its layout, with its language).
export default function CatchAll() {
  notFound();
}
