import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);
        
        // Easing function (ease-out-expo)
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);
        const currentCount = Math.floor(easeOutExpo * end);
        
        setCount(currentCount);

        if (now < endTime) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + "K";
    }
    return num.toLocaleString("de-DE");
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {formatNumber(count)}
      {suffix}
    </motion.span>
  );
}

// Preset counters for common stats
export function ParameterCounter({ className }: { className?: string }) {
  return <AnimatedCounter end={3000} suffix="+" className={className} />;
}

export function AccountsCounter({ className }: { className?: string }) {
  return <AnimatedCounter end={50000} suffix="+" className={className} />;
}

export function AccuracyCounter({ className }: { className?: string }) {
  return <AnimatedCounter end={98} suffix="%" className={className} />;
}

export function AnalysesCounter({ className }: { className?: string }) {
  return <AnimatedCounter end={125000} suffix="+" className={className} />;
}

export function GrowthCounter({ className }: { className?: string }) {
  return <AnimatedCounter end={340} prefix="+" suffix="%" className={className} />;
}
