import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_EMPREENDIMENTOS,
  DEFAULT_LANDING_PAGES,
  DEFAULT_MEDIA,
  DEFAULT_PROFILE,
  DEFAULT_PROPERTIES,
  DEFAULT_SITE_SETTINGS,
} from '../data/seedData';
import type {
  AnalyticsEvent,
  AnalyticsEventType,
  Empreendimento,
  LandingPage,
  Lead,
  LeadStatus,
  MediaAsset,
  ProfessionalProfile,
  Property,
  SiteSettings,
  VisitRequest,
  VisitStatus,
} from '../types/realestate';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { generateSafeId, getUtmParams, slugify } from './utils';

const ADMIN_TOKEN_KEY = 'rm_admin_token';
const OWNER_ADMIN_EMAIL = 'nonhu2490@gmail.com';

interface SiteOverridesPayload {
  siteSettings?: SiteSettings;
  professionalProfile?: ProfessionalProfile;
  empreendimentos?: Empreendimento[];
  properties?: Property[];
  landingPages?: LandingPage[];
  media?: MediaAsset[];
}

function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

function isFirebaseVerifiedAdmin(): boolean {
  const user = auth.currentUser;
  return Boolean(user && user.emailVerified && user.email?.toLowerCase() === OWNER_ADMIN_EMAIL);
}

async function fetchSiteOverrides(): Promise<SiteOverridesPayload> {
  try {
    const res = await fetch('/api/site-data', { cache: 'no-store' });
    if (!res.ok) return {};
    return (await res.json()) as SiteOverridesPayload;
  } catch {
    return {};
  }
}

async function persistSiteOverrides(patch: Partial<SiteOverridesPayload>): Promise<void> {
  const token = getAdminToken();
  if (!token) return;
  try {
    await fetch('/api/site-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });
  } catch {
    // Non-blocking fallback
  }
}

function cleanString(val: unknown, maxLen: number): string {
  return String(val ?? '').trim().slice(0, maxLen);
}

function cleanStringList(arr: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => cleanString(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const overrides = await fetchSiteOverrides();
  if (overrides.siteSettings) {
    return { ...DEFAULT_SITE_SETTINGS, ...overrides.siteSettings, id: 'main' };
  }
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'main'));
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...(snap.data() as SiteSettings), id: snap.id };
    }
    return DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const path = 'siteSettings/main';
  const cleanSettings: SiteSettings = {
    ...settings,
    id: 'main',
    siteName: cleanString(settings.siteName || 'Rodolfo Monteiro', 120),
    tagline: cleanString(settings.tagline, 240),
    primaryColor: cleanString(settings.primaryColor || '#C8102E', 20),
    secondaryColor: cleanString(settings.secondaryColor || '#0B1F3A', 20),
    accentColor: cleanString(settings.accentColor || '#C99E32', 20),
    displayFont: cleanString(settings.displayFont || 'Plus Jakarta Sans', 80),
    bodyFont: cleanString(settings.bodyFont || 'DM Sans', 80),
    logoUrl: cleanString(settings.logoUrl, 1000),
    whatsappNumber: cleanString(settings.whatsappNumber || '5571992106928', 30),
    instagramUrl: cleanString(settings.instagramUrl, 300),
    instagramHandle: cleanString(settings.instagramHandle, 80),
    heroTitle: cleanString(settings.heroTitle || 'Seu novo lar pode começar aqui', 180),
    heroSubtitle: cleanString(settings.heroSubtitle, 400),
    heroTransition: settings.heroTransition || 'crossfade',
    heroIntervalMs: Math.min(20000, Math.max(2000, Number(settings.heroIntervalMs) || 5500)),
    heroImageUrls: cleanStringList(settings.heroImageUrls, 20, 1000),
    floatingWhatsappEnabled: Boolean(settings.floatingWhatsappEnabled),
    floatingInstagramEnabled: Boolean(settings.floatingInstagramEnabled),
    assistantEnabled: Boolean(settings.assistantEnabled),
    assistantName: cleanString(settings.assistantName || 'Assistente da Tenda', 80),
    assistantAvatarUrl: cleanString(settings.assistantAvatarUrl, 1000),
    assistantGreeting: cleanString(settings.assistantGreeting, 400),
    assistantFaqs: (settings.assistantFaqs || []).slice(0, 20).map((faq) => ({
      id: cleanString(faq.id || generateSafeId('faq'), 60),
      question: cleanString(faq.question, 160),
      keywords: cleanStringList(faq.keywords, 12, 40),
      answer: cleanString(faq.answer, 600),
      suggestWhatsapp: Boolean(faq.suggestWhatsapp),
      suggestInstagram: Boolean(faq.suggestInstagram),
    })),
    seoTitle: cleanString(settings.seoTitle, 120),
    seoDescription: cleanString(settings.seoDescription, 300),
    ga4Id: cleanString(settings.ga4Id, 40),
    gtmId: cleanString(settings.gtmId, 40),
    googleAdsId: cleanString(settings.googleAdsId, 40),
    searchConsoleVerification: cleanString(settings.searchConsoleVerification, 120),
    lgpdNotice: cleanString(settings.lgpdNotice, 1000),
    footerText: cleanString(settings.footerText, 300),
  };

  await persistSiteOverrides({ siteSettings: cleanSettings });

  if (!isFirebaseVerifiedAdmin()) return;

  try {
    const { id: _id, ...rest } = cleanSettings;
    await setDoc(
      doc(db, 'siteSettings', 'main'),
      { ...rest, updatedAt: serverTimestamp() },
      { merge: false }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchProfessionalProfile(): Promise<ProfessionalProfile> {
  const overrides = await fetchSiteOverrides();
  if (overrides.professionalProfile) {
    return { ...DEFAULT_PROFILE, ...overrides.professionalProfile, id: 'main' };
  }
  try {
    const snap = await getDoc(doc(db, 'professionalProfile', 'main'));
    if (snap.exists()) {
      return { ...DEFAULT_PROFILE, ...(snap.data() as ProfessionalProfile), id: snap.id };
    }
    return DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfessionalProfile(profile: ProfessionalProfile): Promise<void> {
  const path = 'professionalProfile/main';
  const cleanProfile: ProfessionalProfile = {
    ...profile,
    id: 'main',
    name: cleanString(profile.name || 'Rodolfo Monteiro', 120),
    roleTitle: cleanString(profile.roleTitle || 'Especialista Tenda', 120),
    photoUrl: cleanString(profile.photoUrl, 1000),
    bioShort: cleanString(profile.bioShort, 400),
    bioFull: cleanString(profile.bioFull, 2000),
    region: cleanString(profile.region, 200),
    creci: cleanString(profile.creci, 60),
    contactEmail: cleanString(profile.contactEmail, 150),
    commercialAddress: cleanString(profile.commercialAddress, 240),
    experienceText: cleanString(profile.experienceText, 120),
    highlights: cleanStringList(profile.highlights, 20, 80),
    instagramStatsFollowers: cleanString(profile.instagramStatsFollowers, 40),
    instagramStatsPosts: cleanString(profile.instagramStatsPosts, 40),
  };

  await persistSiteOverrides({ professionalProfile: cleanProfile });

  if (!isFirebaseVerifiedAdmin()) return;

  try {
    const { id: _id, ...rest } = cleanProfile;
    await setDoc(
      doc(db, 'professionalProfile', 'main'),
      { ...rest, updatedAt: serverTimestamp() },
      { merge: false }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchPublicEmpreendimentos(): Promise<Empreendimento[]> {
  const overrides = await fetchSiteOverrides();
  if (Array.isArray(overrides.empreendimentos)) {
    return overrides.empreendimentos.filter((e) => e.published);
  }
  try {
    const q = query(collection(db, 'empreendimentos'), where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) return DEFAULT_EMPREENDIMENTOS;
    return snap.docs.map((d) => ({ ...(d.data() as Empreendimento), id: d.id }));
  } catch {
    return DEFAULT_EMPREENDIMENTOS;
  }
}

export async function fetchAllEmpreendimentos(): Promise<Empreendimento[]> {
  const overrides = await fetchSiteOverrides();
  if (Array.isArray(overrides.empreendimentos)) {
    return overrides.empreendimentos;
  }
  if (!isFirebaseVerifiedAdmin()) {
    return DEFAULT_EMPREENDIMENTOS;
  }
  const path = 'empreendimentos';
  try {
    const snap = await getDocs(collection(db, 'empreendimentos'));
    if (snap.empty) return DEFAULT_EMPREENDIMENTOS;
    return snap.docs.map((d) => ({ ...(d.data() as Empreendimento), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveEmpreendimento(item: Empreendimento, isNew = false): Promise<string> {
  const id = item.id || slugify(item.name) || generateSafeId('emp');
  const cleanItem: Empreendimento = {
    ...item,
    id,
    name: cleanString(item.name, 140),
    slug: slugify(item.slug || item.name) || id.toLowerCase(),
    neighborhood: cleanString(item.neighborhood, 120),
    city: cleanString(item.city || 'Salvador', 120),
    addressNote: cleanString(item.addressNote, 240),
    nearbyHighlights: cleanStringList(item.nearbyHighlights, 15, 160),
    status: item.status || 'A confirmar',
    featured: Boolean(item.featured),
    published: Boolean(item.published),
    confirmationPending: Boolean(item.confirmationPending),
    priceDisplay: cleanString(item.priceDisplay, 80),
    priceNumeric: Math.max(0, Number(item.priceNumeric) || 0),
    bedroomsSummary: cleanString(item.bedroomsSummary, 80),
    leisureArea: cleanString(item.leisureArea, 120),
    description: cleanString(item.description, 3000),
    features: cleanStringList(item.features, 25, 140),
    coverImage: cleanString(item.coverImage, 1000),
    gallery: cleanStringList(item.gallery, 25, 1000),
    paymentFlow: (item.paymentFlow || []).slice(0, 15).map((step) => ({
      label: cleanString(step.label, 80),
      value: cleanString(step.value, 80),
      detail: cleanString(step.detail, 180),
    })),
    paymentFlowNote: cleanString(item.paymentFlowNote, 400),
    tendaConditions: cleanStringList(item.tendaConditions, 15, 120),
  };

  const currentList = await fetchAllEmpreendimentos();
  const existsIdx = currentList.findIndex((e) => e.id === id);
  const nextList =
    existsIdx >= 0
      ? currentList.map((e) => (e.id === id ? cleanItem : e))
      : [...currentList, cleanItem];
  await persistSiteOverrides({ empreendimentos: nextList });

  if (!isFirebaseVerifiedAdmin()) return id;

  const path = `empreendimentos/${id}`;
  try {
    const existingSnap = isNew ? null : await getDoc(doc(db, 'empreendimentos', id));
    const exists = Boolean(existingSnap?.exists());
    const { id: _id, ...rest } = cleanItem;
    await setDoc(
      doc(db, 'empreendimentos', id),
      {
        ...rest,
        createdAt: exists ? existingSnap!.data()!.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: false }
    );
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeEmpreendimento(id: string): Promise<void> {
  const currentList = await fetchAllEmpreendimentos();
  await persistSiteOverrides({
    empreendimentos: currentList.filter((e) => e.id !== id),
  });

  if (!isFirebaseVerifiedAdmin()) return;

  const path = `empreendimentos/${id}`;
  try {
    await deleteDoc(doc(db, 'empreendimentos', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchPublicProperties(): Promise<Property[]> {
  const overrides = await fetchSiteOverrides();
  if (Array.isArray(overrides.properties)) {
    return overrides.properties.filter((p) => p.published);
  }
  try {
    const q = query(collection(db, 'properties'), where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) return DEFAULT_PROPERTIES;
    return snap.docs.map((d) => ({ ...(d.data() as Property), id: d.id }));
  } catch {
    return DEFAULT_PROPERTIES;
  }
}

export async function fetchAllProperties(): Promise<Property[]> {
  const overrides = await fetchSiteOverrides();
  if (Array.isArray(overrides.properties)) {
    return overrides.properties;
  }
  if (!isFirebaseVerifiedAdmin()) {
    return DEFAULT_PROPERTIES;
  }
  const path = 'properties';
  try {
    const snap = await getDocs(collection(db, 'properties'));
    if (snap.empty) return DEFAULT_PROPERTIES;
    return snap.docs.map((d) => ({ ...(d.data() as Property), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveProperty(item: Property, isNew = false): Promise<string> {
  const id = item.id || generateSafeId('prop');
  const cleanItem: Property = {
    ...item,
    id,
    title: cleanString(item.title, 160),
    slug: slugify(item.slug || item.title) || id.toLowerCase(),
    empreendimentoId: cleanString(item.empreendimentoId, 128),
    empreendimentoName: cleanString(item.empreendimentoName, 140),
    neighborhood: cleanString(item.neighborhood, 120),
    city: cleanString(item.city || 'Salvador', 120),
    bedrooms: Math.min(10, Math.max(0, Number(item.bedrooms) || 0)),
    bathrooms: cleanString(item.bathrooms || 'A confirmar', 40),
    areaText: cleanString(item.areaText || 'A confirmar', 60),
    parkingText: cleanString(item.parkingText || 'A confirmar', 60),
    priceNumeric: Math.max(0, Number(item.priceNumeric) || 0),
    priceDisplay: cleanString(item.priceDisplay || 'A confirmar', 80),
    entryCondition: cleanString(item.entryCondition, 160),
    acceptsFgts: Boolean(item.acceptsFgts),
    acceptsSubsidy: Boolean(item.acceptsSubsidy),
    confirmationPending: Boolean(item.confirmationPending),
    isLaunch: Boolean(item.isLaunch),
    featured: Boolean(item.featured),
    published: Boolean(item.published),
    coverImage: cleanString(item.coverImage, 1000),
    gallery: cleanStringList(item.gallery, 25, 1000),
    description: cleanString(item.description, 2500),
    features: cleanStringList(item.features, 25, 140),
  };

  const currentList = await fetchAllProperties();
  const existsIdx = currentList.findIndex((p) => p.id === id);
  const nextList =
    existsIdx >= 0
      ? currentList.map((p) => (p.id === id ? cleanItem : p))
      : [...currentList, cleanItem];
  await persistSiteOverrides({ properties: nextList });

  if (!isFirebaseVerifiedAdmin()) return id;

  const path = `properties/${id}`;
  try {
    const existingSnap = isNew ? null : await getDoc(doc(db, 'properties', id));
    const exists = Boolean(existingSnap?.exists());
    const { id: _id, ...rest } = cleanItem;
    await setDoc(
      doc(db, 'properties', id),
      {
        ...rest,
        createdAt: exists ? existingSnap!.data()!.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: false }
    );
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeProperty(id: string): Promise<void> {
  const currentList = await fetchAllProperties();
  await persistSiteOverrides({
    properties: currentList.filter((p) => p.id !== id),
  });

  if (!isFirebaseVerifiedAdmin()) return;

  const path = `properties/${id}`;
  try {
    await deleteDoc(doc(db, 'properties', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchPublicLandingPages(): Promise<LandingPage[]> {
  const overrides = await fetchSiteOverrides();
  if (Array.isArray(overrides.landingPages)) {
    return overrides.landingPages.filter((lp) => lp.status === 'published');
  }
  try {
    const q = query(collection(db, 'landingPages'), where('status', '==', 'published'));
    const snap = await getDocs(q);
    if (snap.empty) return DEFAULT_LANDING_PAGES;
    return snap.docs.map((d) => ({ ...(d.data() as LandingPage), id: d.id }));
  } catch {
    return DEFAULT_LANDING_PAGES;
  }
}

export async function fetchAllLandingPages(): Promise<LandingPage[]> {
  const overrides = await fetchSiteOverrides();
  if (Array.isArray(overrides.landingPages)) {
    return overrides.landingPages;
  }
  if (!isFirebaseVerifiedAdmin()) {
    return DEFAULT_LANDING_PAGES;
  }
  const path = 'landingPages';
  try {
    const snap = await getDocs(collection(db, 'landingPages'));
    if (snap.empty) return DEFAULT_LANDING_PAGES;
    return snap.docs.map((d) => ({ ...(d.data() as LandingPage), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveLandingPage(item: LandingPage, isNew = false): Promise<string> {
  const id = item.id || generateSafeId('lp');
  const cleanItem: LandingPage = {
    ...item,
    id,
    title: cleanString(item.title, 160),
    slug: slugify(item.slug || item.title) || id.toLowerCase(),
    routePrefix: item.routePrefix === 'campanha' ? 'campanha' : 'oportunidade',
    isPremium: Boolean(item.isPremium),
    status: item.status || 'draft',
    empreendimentoId: cleanString(item.empreendimentoId, 128),
    heroKicker: cleanString(item.heroKicker, 120),
    heroHeadline: cleanString(item.heroHeadline, 180),
    heroSubheadline: cleanString(item.heroSubheadline, 400),
    heroImageUrl: cleanString(item.heroImageUrl, 1000),
    ctaPrimaryText: cleanString(item.ctaPrimaryText || 'Simular agora', 80),
    ctaWhatsappText: cleanString(item.ctaWhatsappText || 'Falar no WhatsApp', 80),
    highlights: cleanStringList(item.highlights, 15, 180),
    gallery: cleanStringList(item.gallery, 20, 1000),
    showPaymentFlow: Boolean(item.showPaymentFlow),
    seoTitle: cleanString(item.seoTitle, 120),
    seoDescription: cleanString(item.seoDescription, 300),
    ogImageUrl: cleanString(item.ogImageUrl, 1000),
    utmCampaign: cleanString(item.utmCampaign, 100),
  };

  // Enforce "exactly one premium landing page" rule in overrides
  const currentList = await fetchAllLandingPages();
  const normalized = currentList.map((lp) =>
    cleanItem.isPremium && lp.id !== id ? { ...lp, isPremium: false } : lp
  );
  const existsIdx = normalized.findIndex((lp) => lp.id === id);
  const nextList =
    existsIdx >= 0
      ? normalized.map((lp) => (lp.id === id ? cleanItem : lp))
      : [...normalized, cleanItem];
  await persistSiteOverrides({ landingPages: nextList });

  if (!isFirebaseVerifiedAdmin()) return id;

  const path = `landingPages/${id}`;
  try {
    const batch = writeBatch(db);
    if (cleanItem.isPremium) {
      const existingPages = await getDocs(collection(db, 'landingPages'));
      existingPages.docs.forEach((d) => {
        if (d.id !== id && d.data().isPremium === true) {
          batch.update(doc(db, 'landingPages', d.id), {
            isPremium: false,
            updatedAt: serverTimestamp(),
          });
        }
      });
    }

    const existingSnap = isNew ? null : await getDoc(doc(db, 'landingPages', id));
    const exists = Boolean(existingSnap?.exists());
    const { id: _id, ...rest } = cleanItem;
    batch.set(
      doc(db, 'landingPages', id),
      {
        ...rest,
        createdAt: exists ? existingSnap!.data()!.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: false }
    );
    await batch.commit();
    return id;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function removeLandingPage(id: string): Promise<void> {
  const currentList = await fetchAllLandingPages();
  await persistSiteOverrides({
    landingPages: currentList.filter((lp) => lp.id !== id),
  });

  if (!isFirebaseVerifiedAdmin()) return;

  const path = `landingPages/${id}`;
  try {
    await deleteDoc(doc(db, 'landingPages', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitLead(input: {
  name: string;
  phone: string;
  email?: string;
  monthlyIncome?: string;
  hasFgts?: boolean;
  fgtsEstimate?: string;
  interestEmpreendimento?: string;
  message?: string;
  sourcePage?: string;
  lgpdConsent: boolean;
}): Promise<string> {
  const id = generateSafeId('lead');
  const path = `leads/${id}`;
  const utms = getUtmParams();
  try {
    await setDoc(doc(db, 'leads', id), {
      name: cleanString(input.name, 120),
      phone: cleanString(input.phone, 30),
      email: cleanString(input.email, 150),
      monthlyIncome: cleanString(input.monthlyIncome, 80),
      hasFgts: Boolean(input.hasFgts),
      fgtsEstimate: cleanString(input.fgtsEstimate, 80),
      interestEmpreendimento: cleanString(input.interestEmpreendimento, 140),
      message: cleanString(input.message, 1000),
      sourcePage: cleanString(input.sourcePage || window.location.pathname, 200),
      utmSource: utms.utmSource,
      utmMedium: utms.utmMedium,
      utmCampaign: utms.utmCampaign,
      status: 'Novo',
      adminNotes: '',
      lgpdConsent: Boolean(input.lgpdConsent),
      createdAt: serverTimestamp(),
    });
    void recordAnalyticsEvent(
      'simulation_submit',
      input.sourcePage || window.location.pathname,
      input.interestEmpreendimento || 'Simulação'
    );
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchAllLeads(): Promise<Lead[]> {
  if (!isFirebaseVerifiedAdmin()) return [];
  const path = 'leads';
  try {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Lead), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  adminNotes: string
): Promise<void> {
  if (!isFirebaseVerifiedAdmin()) return;
  const path = `leads/${id}`;
  try {
    await updateDoc(doc(db, 'leads', id), {
      status,
      adminNotes: cleanString(adminNotes, 1000),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeLead(id: string): Promise<void> {
  if (!isFirebaseVerifiedAdmin()) return;
  const path = `leads/${id}`;
  try {
    await deleteDoc(doc(db, 'leads', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function submitVisitRequest(input: {
  name: string;
  phone: string;
  preferredDate?: string;
  preferredPeriod?: 'Manhã' | 'Tarde' | 'Fim de semana';
  empreendimentoName: string;
  notes?: string;
  sourcePage?: string;
}): Promise<string> {
  const id = generateSafeId('visit');
  const path = `visitRequests/${id}`;
  const utms = getUtmParams();
  try {
    await setDoc(doc(db, 'visitRequests', id), {
      name: cleanString(input.name, 120),
      phone: cleanString(input.phone, 30),
      preferredDate: cleanString(input.preferredDate, 40),
      preferredPeriod: input.preferredPeriod || 'Manhã',
      empreendimentoName: cleanString(input.empreendimentoName || 'A confirmar', 140),
      notes: cleanString(input.notes, 600),
      sourcePage: cleanString(input.sourcePage || window.location.pathname, 200),
      utmSource: utms.utmSource,
      utmCampaign: utms.utmCampaign,
      status: 'Pendente',
      createdAt: serverTimestamp(),
    });
    void recordAnalyticsEvent(
      'visit_submit',
      input.sourcePage || window.location.pathname,
      input.empreendimentoName
    );
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchAllVisitRequests(): Promise<VisitRequest[]> {
  if (!isFirebaseVerifiedAdmin()) return [];
  const path = 'visitRequests';
  try {
    const q = query(collection(db, 'visitRequests'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as VisitRequest), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateVisitStatus(
  id: string,
  status: VisitStatus,
  notes: string
): Promise<void> {
  if (!isFirebaseVerifiedAdmin()) return;
  const path = `visitRequests/${id}`;
  try {
    await updateDoc(doc(db, 'visitRequests', id), {
      status,
      notes: cleanString(notes, 600),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchAllMedia(): Promise<MediaAsset[]> {
  const overrides = await fetchSiteOverrides();
  if (Array.isArray(overrides.media)) {
    return overrides.media;
  }
  if (!isFirebaseVerifiedAdmin()) {
    return DEFAULT_MEDIA;
  }
  const path = 'media';
  try {
    const snap = await getDocs(collection(db, 'media'));
    if (snap.empty) return DEFAULT_MEDIA;
    return snap.docs.map((d) => ({ ...(d.data() as MediaAsset), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveMediaAsset(
  asset: Omit<MediaAsset, 'id'> & { id?: string }
): Promise<MediaAsset> {
  const id = asset.id || generateSafeId('media');
  const cleanAsset: MediaAsset = {
    ...asset,
    id,
    name: cleanString(asset.name, 140),
    url: cleanString(asset.url, 2000),
    category: asset.category || 'Outros',
    storageProvider: asset.storageProvider || 'external',
  };

  const currentList = await fetchAllMedia();
  const nextList = [cleanAsset, ...currentList.filter((m) => m.id !== id)];
  await persistSiteOverrides({ media: nextList });

  if (!isFirebaseVerifiedAdmin()) return cleanAsset;

  const path = `media/${id}`;
  try {
    const { id: _id, ...rest } = cleanAsset;
    await setDoc(doc(db, 'media', id), { ...rest, createdAt: serverTimestamp() }, { merge: false });
    return cleanAsset;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteBlobFile(url: string): Promise<void> {
  if (!url) return;
  if (!url.includes('blob.vercel-storage.com') && !url.startsWith('/uploads/')) {
    return;
  }
  try {
    await fetch('/api/delete-blob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Non-blocking storage cleanup
  }
}

export async function removeMediaAsset(id: string): Promise<void> {
  const currentList = await fetchAllMedia();
  const target = currentList.find((m) => m.id === id);
  if (target?.url) {
    await deleteBlobFile(target.url);
  }

  await persistSiteOverrides({
    media: currentList.filter((m) => m.id !== id),
  });

  if (!isFirebaseVerifiedAdmin()) return;

  const path = `media/${id}`;
  try {
    await deleteDoc(doc(db, 'media', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchStorageStatus(): Promise<{
  provider: 'vercel-blob' | 'local-asset';
  vercelBlobConfigured: boolean;
}> {
  try {
    const res = await fetch('/api/storage-status', { cache: 'no-store' });
    if (!res.ok) {
      return { provider: 'local-asset', vercelBlobConfigured: false };
    }
    return (await res.json()) as {
      provider: 'vercel-blob' | 'local-asset';
      vercelBlobConfigured: boolean;
    };
  } catch {
    return { provider: 'local-asset', vercelBlobConfigured: false };
  }
}

export async function uploadMediaFile(
  file: File,
  category: MediaAsset['category'] = 'Empreendimento'
): Promise<MediaAsset> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione apenas arquivos de imagem (JPG, PNG, WEBP).');
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('A imagem excede o limite de 15MB.');
  }

  const asciiName = file.name.replace(/[^\x20-\x7E]/g, '_');
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'image/jpeg',
      'x-file-name': asciiName,
      'x-media-category': category,
    },
    body: file,
  });

  if (!response.ok) {
    let errMsg = 'Falha ao enviar arquivo de mídia.';
    try {
      const errBody = (await response.json()) as { error?: string };
      if (errBody?.error) errMsg = errBody.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errMsg);
  }

  const data = (await response.json()) as { url: string; provider: MediaAsset['storageProvider'] };
  return saveMediaAsset({
    name: file.name.replace(/\.[^.]+$/, ''),
    url: data.url,
    category,
    storageProvider: data.provider || 'local-asset',
  });
}

export async function recordAnalyticsEvent(
  eventType: AnalyticsEventType,
  pathStr: string,
  label = ''
): Promise<void> {
  const id = generateSafeId('evt');
  const utms = getUtmParams();
  try {
    await setDoc(doc(db, 'analytics', id), {
      eventType,
      path: cleanString(pathStr || '/', 200),
      label: cleanString(label, 140),
      utmSource: utms.utmSource,
      utmCampaign: utms.utmCampaign,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking analytics
  }
}

export async function fetchAllAnalytics(): Promise<AnalyticsEvent[]> {
  if (!isFirebaseVerifiedAdmin()) return [];
  const path = 'analytics';
  try {
    const q = query(collection(db, 'analytics'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as AnalyticsEvent), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function seedDatabaseIfEmpty(): Promise<void> {
  if (!isFirebaseVerifiedAdmin()) return;
  try {
    const settingsSnap = await getDoc(doc(db, 'siteSettings', 'main'));
    if (!settingsSnap.exists()) {
      await saveSiteSettings(DEFAULT_SITE_SETTINGS);
    }

    const profileSnap = await getDoc(doc(db, 'professionalProfile', 'main'));
    if (!profileSnap.exists()) {
      await saveProfessionalProfile(DEFAULT_PROFILE);
    }

    const empSnap = await getDocs(collection(db, 'empreendimentos'));
    if (empSnap.empty) {
      for (const emp of DEFAULT_EMPREENDIMENTOS) {
        await saveEmpreendimento(emp, true);
      }
    }

    const propSnap = await getDocs(collection(db, 'properties'));
    if (propSnap.empty) {
      for (const prop of DEFAULT_PROPERTIES) {
        await saveProperty(prop, true);
      }
    }

    const lpSnap = await getDocs(collection(db, 'landingPages'));
    if (lpSnap.empty) {
      for (const lp of DEFAULT_LANDING_PAGES) {
        await saveLandingPage(lp, true);
      }
    }

    const mediaSnap = await getDocs(collection(db, 'media'));
    if (mediaSnap.empty) {
      for (const item of DEFAULT_MEDIA) {
        await saveMediaAsset(item);
      }
    }
  } catch (error) {
    console.warn('Seed check notice:', error);
  }
}
