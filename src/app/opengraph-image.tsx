import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "Grow Digital — The agile integrator";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "The agile integrator", title: "It's time to grow." });
}
