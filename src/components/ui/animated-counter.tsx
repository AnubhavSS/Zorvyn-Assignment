import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  prefix = "", 
  suffix = "", 
  decimals = 0,
  className 
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  
  const displayValue = useTransform(springValue, (current) => {
    return `${prefix}${current.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}
