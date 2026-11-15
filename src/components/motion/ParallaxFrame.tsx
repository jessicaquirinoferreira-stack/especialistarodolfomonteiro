import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ParallaxFrameProps {
  children: ReactNode;
  className?: string;
  offset?: number;
}

export function ParallaxFrame({
  children,
  className,
  offset = 36,
}: ParallaxFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={prefersReduced ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
