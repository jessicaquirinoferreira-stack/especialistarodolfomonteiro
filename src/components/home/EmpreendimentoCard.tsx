import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Empreendimento } from '../../types/realestate';
import { SafeImage } from '../common/SafeImage';
import { SpotlightCard } from '../motion/SpotlightCard';

interface EmpreendimentoCardProps {
  item: Empreendimento;
  premiumSlug?: string;
}

export function EmpreendimentoCard({ item, premiumSlug }: EmpreendimentoCardProps) {
  const isPremiumLinked = premiumSlug && premiumSlug === item.slug;

  return (
    <SpotlightCard className="flex flex-col h-full">
      <Link
        to={`/empreendimento/${item.slug}`}
        className="group relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block"
      >
        <SafeImage
          src={item.coverImage}
          alt={item.name}
          fallbackTitle={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent"
        />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-medium text-white">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#C99E32]" />
            <span>
              {item.neighborhood ? `${item.neighborhood} · ` : ''}
              {item.city}
            </span>
          </span>
          <span className="text-white/90">{item.status}</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-5">
        <div className="space-y-2.5">
          {/* Zero-pill unboxed metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span>{item.bedroomsSummary || 'Tipologia a confirmar'}</span>
            {item.leisureArea && item.leisureArea !== 'A confirmar' && (
              <>
                <span aria-hidden="true">·</span>
                <span>{item.leisureArea}</span>
              </>
            )}
          </div>

          <h3 className="font-display text-xl font-bold text-[#0B1F3A] tracking-tight">
            <Link to={`/empreendimento/${item.slug}`} className="hover:text-[#C8102E] transition-colors">
              {item.name}
            </Link>
          </h3>

          <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
            {item.description}
          </p>

          {item.nearbyHighlights?.length > 0 && (
            <ul className="space-y-1 pt-1 text-xs text-slate-600">
              {item.nearbyHighlights.slice(0, 2).map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="text-[#C8102E] font-bold" aria-hidden="true">
                    ·
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-slate-500">Valor de referência</span>
            <span className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
              {item.priceDisplay || 'A confirmar'}
            </span>
          </div>

          {item.confirmationPending && (
            <p className="text-[11px] text-slate-500">
              Disponibilidade e condições vigentes a confirmar com o corretor.
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Link
              to={`/empreendimento/${item.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#132C4E] transition-colors whitespace-nowrap"
            >
              <span>Ver detalhes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {isPremiumLinked ? (
              <Link
                to={`/oportunidade/${premiumSlug}`}
                className="inline-flex items-center justify-center rounded-lg border border-[#C8102E] px-3.5 py-2.5 text-xs font-semibold text-[#C8102E] hover:bg-[#C8102E] hover:text-white transition-colors whitespace-nowrap"
              >
                Página Especial
              </Link>
            ) : (
              <Link
                to={`/simulacao?empreendimento=${encodeURIComponent(item.name)}`}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Simular
              </Link>
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
