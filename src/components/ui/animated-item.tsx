import { motion, type HTMLMotionProps } from "motion/react";
import { item } from "~/lib/motion";

interface AnimatedItemProps extends HTMLMotionProps<"div"> {}

export function AnimatedItem({ children, className, ...props }: AnimatedItemProps) {
  return (
    <motion.div className={className} variants={item} {...props}>
      {children}
    </motion.div>
  );
}
