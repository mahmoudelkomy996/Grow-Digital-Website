import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { ar } from "./ar";

export type { Dictionary };

export const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };
