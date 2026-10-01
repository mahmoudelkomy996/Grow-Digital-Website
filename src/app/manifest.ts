import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grow Digital — The agile integrator",
    short_name: "Grow Digital",
    description: "One accountable team to consult, transform, build, operate, secure and grow, for enterprises in KSA and the UAE.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f5f0",
    theme_color: "#083b3b",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
