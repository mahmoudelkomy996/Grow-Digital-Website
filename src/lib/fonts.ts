import { Amiri, Instrument_Serif, JetBrains_Mono, Outfit, Readex_Pro } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Arabic: Readex Pro (geometric, close to Outfit) for text and labels; Amiri (naskh) for the accent word.
// Not preloaded, so English pages never download them; Arabic pages swap them in from the CSS.
const readex = Readex_Pro({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-readex",
  display: "swap",
  preload: false,
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});

export const fontVariables = `${outfit.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${readex.variable} ${amiri.variable}`;
