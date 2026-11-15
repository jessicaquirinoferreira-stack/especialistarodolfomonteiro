import { useState, type MouseEvent, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(200, 16, 46, 0.09)',
}: SpotlightCardProps) {
  const [coords, setCoords] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  }

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={() => setCoords((prev) => ({ ...prev, active: false }))}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-transform duration-200 hover:-translate-y-0.5',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: coords.active ? 1 : 0,
          background: `radial-gradient(420px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
