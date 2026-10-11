// Story progress helpers shared by the HTML scaffold (GrowthStory) and the 3D scene.
// The scene runs 9 beats ("story units" s = p * 9); copy chapters own spans of beats (see content/story.ts).

export const CHAPTER_COUNT = 9;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Map story progress p (0..1) to chapter index i and local t (0..1 within that chapter). */
export function segment(p: number, n = CHAPTER_COUNT): { i: number; t: number } {
  const s = clamp(p) * n;
  const i = Math.min(n - 1, Math.floor(s));
  return { i, t: clamp(s - i) };
}

/** Index of the chapter whose span [from, to) contains story units s (the last chapter past the end). */
export function chapterAt(spans: readonly (readonly [number, number])[], s: number): number {
  const i = spans.findIndex(([, to]) => s < to);
  return i === -1 ? spans.length - 1 : i;
}

/** Panel opacity for a chapter spanning [a, b) story units at s; fades over 0.16 units at each edge. */
export function spanOpacity([a, b]: readonly [number, number], s: number, first: boolean, last: boolean): number {
  if (s <= a - 0.02 || s >= b + 0.02) return 0;
  const fadeIn = first ? 1 : clamp((s - a) / 0.16);
  const fadeOut = last ? 1 : clamp((b - s) / 0.16);
  return Math.min(fadeIn, fadeOut);
}
