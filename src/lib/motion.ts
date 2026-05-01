// Shared animation constants and helpers
// Reference: https://easing.dev/ for custom curves

import { useReducedMotion } from "motion/react";

export const easings = {
  /** Strong ease-out for UI interactions (entering elements) */
  out: [0.19, 1, 0.22, 1] as const,
  /** Strong ease-in-out for on-screen movement */
  inOut: [0.77, 0, 0.175, 1] as const,
  /** Standard ease for color/hover transitions */
  standard: [0.25, 0.1, 0.25, 1] as const,
  /** iOS-like drawer curve */
  drawer: [0.32, 0.72, 0, 1] as const,
} as const;

export const durations = {
  press: 0.16,
  tooltip: 0.15,
  dropdown: 0.2,
  accordionOpen: 0.35,
  accordionClose: 0.25,
  section: 0.6,
  stagger: 0.08,
  heroStagger: 0.1,
} as const;

export const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.section, ease: easings.out },
  },
} as const;

export function container(stagger: number = durations.stagger) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
      },
    },
  } as const;
}

export function useScrollReveal(stagger: number = durations.stagger) {
  const prefersReducedMotion = useReducedMotion();

  return {
    variants: container(stagger),
    initial: prefersReducedMotion ? false : "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.1 },
  } as const;
}

export { useReducedMotion };
