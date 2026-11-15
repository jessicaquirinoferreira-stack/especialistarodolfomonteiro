import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function generateSafeId(prefix = 'doc'): string {
  const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'doc';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${cleanPrefix}-${Date.now()}-${rand}`;
}

export function getUtmParams(): {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
} {
  if (typeof window === 'undefined') {
    return { utmSource: '', utmMedium: '', utmCampaign: '' };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: (params.get('utm_source') || '').slice(0, 100),
    utmMedium: (params.get('utm_medium') || '').slice(0, 100),
    utmCampaign: (params.get('utm_campaign') || '').slice(0, 100),
  };
}

export function buildWhatsappUrl(whatsappNumber: string, message: string): string {
  const digits = (whatsappNumber || '5571992106928').replace(/\D/g, '');
  const normalized = digits.startsWith('55') ? digits : `55${digits}`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

export function formatCurrencyBRL(value?: number): string {
  if (!value || Number.isNaN(value)) return 'A confirmar';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}
