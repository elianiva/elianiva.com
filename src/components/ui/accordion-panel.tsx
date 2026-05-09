import { LazyMotion, m, domAnimation, type HTMLMotionProps } from "motion/react";
import { durations, useReducedMotion } from "~/lib/motion";

interface AccordionPanelProps extends Omit<HTMLMotionProps<"div">, "animate" | "initial" | "transition"> {
  open: boolean;
}

export function AccordionPanel({ open, children, className, ...props }: AccordionPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
    <m.div
      initial={false}
      animate={{
        height: open ? "auto" : 0,
        opacity: open ? 1 : 0,
      }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: open ? durations.accordionOpen : durations.accordionClose, ease: "easeOut" }
      }
      className={className ?? "overflow-hidden"}
      {...props}
    >
      {children}
    </m.div>
    </LazyMotion>
  );
}
