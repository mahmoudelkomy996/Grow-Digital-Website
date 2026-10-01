// Story progress helpers shared by the HTML scaffold (GrowthStory) and the 3D scene.
// Chapter i spans story progress p ∈ [i/9, (i+1)/9]; "story units" are s = p * 9.

export const CHAPTER_COUNT = 9;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Map story progress p (0..1) to chapter index i and local t (0..1 within that chapter). */
export function segment(p: number, n = CHAPTER_COUNT): { i: number; t: number } {
  const s = clamp(p) * n;
  const i = Math.min(n - 1, Math.floor(s));
  return { i, t: clamp(s - i) };
}

/** Panel opacity for chapter i at progress p (the prototype's updatePanels cross-fade). */
export function panelOpacity(i: number, p: number, n = CHAPTER_COUNT): { o: number; local: number } {
  const local = p * n - i;
  let o = 0;
  if (local > -0.02 && local < 1.02) {
    const fadeIn = i === 0 ? 1 : clamp(local / 0.16);
    const fadeOut = i === n - 1 ? 1 : clamp((1 - local) / 0.16);
    o = Math.min(fadeIn, fadeOut);
  }
  return { o, local };
}
