import { Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({ src, alt, className, fallbackTitle }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1F3A] via-[#132C4E] to-[#1E3A5F] text-white/80 p-4 text-center',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <Building2 className="h-8 w-8 text-[#C99E32] mb-2" />
        <span className="text-xs font-medium tracking-wide text-white/90 line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
