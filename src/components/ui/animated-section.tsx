import { motion, type HTMLMotionProps } from "motion/react";
import { useScrollReveal } from "~/lib/motion";

interface AnimatedSectionProps extends HTMLMotionProps<"section"> {
  animateOnMount?: boolean;
}

export function AnimatedSection({
  animateOnMount = false,
  className,
  children,
  ...props
}: AnimatedSectionProps) {
  const reveal = useScrollReveal();

  if (animateOnMount) {
    return (
      <motion.section
        className={className}
        initial="hidden"
        animate="visible"
        variants={reveal.variants}
        {...props}
      >
        {children}
      </motion.section>
    );
  }

  return (
    <motion.section className={className} {...reveal} {...props}>
      {children}
    </motion.section>
  );
}
