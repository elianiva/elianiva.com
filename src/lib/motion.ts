// Animation constants and helpers
// Reference: https://easing.dev/ for custom curves

import { useReducedMotion } from "motion/react";

export const easings = {
  /** Strong ease-out for UI interactions (entering elements) */
  out: [0.19, 1, 0.22, 1] as const,
} as const;

export const durations = {
  accordionOpen: 0.15,
  accordionClose: 0.2,
} as const;

export { useReducedMotion };
