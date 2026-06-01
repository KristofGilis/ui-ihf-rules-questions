/**
 * Seeded random utilities used by the quiz so the same seed produces the same
 * sequence of picks. Enables reproducible quizzes (resume/replay) and lets the
 * offline question source and the answer shuffler share a single seed per
 * session.
 */

/** Returns a non-zero 32-bit unsigned seed using crypto when available. */
export function createSeed(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] || 1;
  }
  // Fallback: Math.random() in [0,1) → 32-bit
  return Math.floor(Math.random() * 0xffffffff) >>> 0 || 1;
}

/**
 * mulberry32 — small, well-distributed seeded PRNG.
 * Returns a function producing floats in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle using the provided RNG; returns a new array. */
export function shuffle<T>(array: readonly T[], rng: () => number): T[] {
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
