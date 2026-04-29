import { useEffect, useState } from "react";
import { useInView, animate } from "motion/react";
import { useRef } from "react";

export function useCountUp(target: number, duration = 1.5) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, target, {
      duration,
      ease: [0.19, 1, 0.22, 1],
      onUpdate: (value) => {
        setDisplay(Math.round(value));
      },
    });

    return controls.stop;
  }, [isInView, target, duration]);

  return { ref, display };
}
