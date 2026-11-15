import { cn } from '../../lib/utils';

interface BorderBeamProps {
  className?: string;
}

export function BorderBeam({ className }: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] p-[1.5px] [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]',
        className
      )}
    >
      <div className="animate-border-beam absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_260deg,#C99E32_310deg,#C8102E_345deg,transparent_360deg)]" />
    </div>
  );
}
