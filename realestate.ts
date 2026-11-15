export type HeroTransitionType = 'crossfade' | 'slide' | 'zoom';

export interface AssistantFaqItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  suggestWhatsapp?: boolean;
  suggestInstagram?: boolean;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  displayFont: string;
  bodyFont: string;
  logoUrl: string;
  whatsappNumber: string;
  instagramUrl: string;
  instagramHandle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTransition: HeroTransitionType;
  heroIntervalMs: number;
  heroImageUrls: string[];
  floatingWhatsappEnabled: boolean;
  floatingInstagramEnabled: boolean;
  assistantEnabled: boolean;
  assistantName: string;
  assistantAvatarUrl: string;
  assistantGreeting: string;
  assistantFaqs: AssistantFaqItem[];
  seoTitle: string;
  seoDescription: string;
  ga4Id: string;
  gtmId: string;
  googleAdsId: string;
  searchConsoleVerification: string;
  lgpdNotice: string;
  footerText: string;
  updatedAt?: unknown;
}

export interface ProfessionalProfile {
  id?: string;
  name: string;
  roleTitle: string;
  photoUrl: string;
  bioShort: string;
  bioFull: string;
  region: string;
  creci: string;
  contactEmail: string;
  commercialAddress: string;
  experienceText: string;
  highlights: string[];
  instagramStatsFollowers: string;
  instagramStatsPosts: string;
  updatedAt?: unknown;
}

export interface PaymentFlowStep {
  label: string;
  value: string;
  detail?: string;
}

export type EmpreendimentoStatus =
  | 'Lançamento'
  | 'Breve lançamento'
  | 'Em obras'
  | 'Pronto'
  | 'A confirmar';

export interface Empreendimento {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city: string;
  addressNote: string;
  nearbyHighlights: string[];
  status: EmpreendimentoStatus;
  featured: boolean;
  published: boolean;
  confirmationPending: boolean;
  priceDisplay: string;
  priceNumeric: number;
  bedroomsSummary: string;
  leisureArea: string;
  description: string;
  features: string[];
  coverImage: string;
  gallery: string[];
  paymentFlow: PaymentFlowStep[];
  paymentFlowNote: string;
  tendaConditions: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  empreendimentoId: string;
  empreendimentoName: string;
  neighborhood: string;
  city: string;
  bedrooms: number;
  bathrooms: string;
  areaText: string;
  parkingText: string;
  priceNumeric: number;
  priceDisplay: string;
  entryCondition: string;
  acceptsFgts: boolean;
  acceptsSubsidy: boolean;
  confirmationPending: boolean;
  isLaunch: boolean;
  featured: boolean;
  published: boolean;
  coverImage: string;
  gallery: string[];
  description: string;
  features: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  routePrefix: 'oportunidade' | 'campanha';
  isPremium: boolean;
  status: 'published' | 'paused' | 'draft';
  empreendimentoId: string;
  heroKicker: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  ctaPrimaryText: string;
  ctaWhatsappText: string;
  highlights: string[];
  gallery: string[];
  showPaymentFlow: boolean;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  utmCampaign: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type LeadStatus =
  | 'Novo'
  | 'Em atendimento'
  | 'Simulação enviada'
  | 'Visita agendada'
  | 'Concluído';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  monthlyIncome: string;
  hasFgts: boolean;
  fgtsEstimate: string;
  interestEmpreendimento: string;
  message: string;
  sourcePage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  status: LeadStatus;
  adminNotes: string;
  lgpdConsent: boolean;
  createdAt?: unknown;
}

export type VisitStatus = 'Pendente' | 'Confirmada' | 'Realizada' | 'Cancelada';

export interface VisitRequest {
  id: string;
  name: string;
  phone: string;
  preferredDate: string;
  preferredPeriod: 'Manhã' | 'Tarde' | 'Fim de semana';
  empreendimentoName: string;
  notes: string;
  sourcePage: string;
  utmSource: string;
  utmCampaign: string;
  status: VisitStatus;
  createdAt?: unknown;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  category: 'Empreendimento' | 'Hero' | 'Perfil' | 'Landing' | 'Outros';
  storageProvider: 'vercel-blob' | 'local-asset' | 'external';
  createdAt?: unknown;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'whatsapp_click'
  | 'instagram_click'
  | 'simulation_submit'
  | 'visit_submit'
  | 'assistant_open';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  path: string;
  label: string;
  utmSource: string;
  utmCampaign: string;
  createdAt?: unknown;
}
