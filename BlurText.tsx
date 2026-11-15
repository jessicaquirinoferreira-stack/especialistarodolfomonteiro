import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

interface BlurTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  delay?: number;
}

export function BlurText({
  text,
  className,
  as = 'h1',
  delay = 0,
}: BlurTextProps) {
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');
  const Tag = motion[as];

  if (prefersReduced) {
    const PlainTag = as;
    return <PlainTag className={className}>{text}</PlainTag>;
  }

  return (
    <Tag
      className={cn('text-balance', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.26em] last:mr-0"
          variants={{
            hidden: { opacity: 0, filter: 'blur(8px)', y: 12 },
            visible: {
              opacity: 1,
              filter: 'blur(0px)',
              y: 0,
              transition: {
                duration: 0.45,
                delay: delay + i * 0.045,
                ease: [0.16, 1, 0.3, 1],
              },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
