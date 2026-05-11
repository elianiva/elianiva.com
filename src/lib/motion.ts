// Animation constants and helpers
// Reference: https://easing.dev/ for custom curves

import { useReducedMotion } from "motion/react";

export const easings = {
  out: [0.19, 1, 0.22, 1] as const,
} as const;

export { useReducedMotion };
