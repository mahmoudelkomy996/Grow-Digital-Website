// Shared e2e helpers.

/** Init script: mark the homepage preloader as already seen this session, so tests interact at once. */
export function skipPreloader() {
  try {
    sessionStorage.setItem("gd:preloaded", "1");
  } catch {
    /* storage unavailable */
  }
}
