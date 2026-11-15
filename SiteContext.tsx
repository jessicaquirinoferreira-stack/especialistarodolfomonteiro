import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_EMPREENDIMENTOS,
  DEFAULT_LANDING_PAGES,
  DEFAULT_PROFILE,
  DEFAULT_PROPERTIES,
  DEFAULT_SITE_SETTINGS,
} from '../data/seedData';
import { auth, db, googleProvider } from '../lib/firebase';
import {
  fetchProfessionalProfile,
  fetchPublicEmpreendimentos,
  fetchPublicLandingPages,
  fetchPublicProperties,
  fetchSiteSettings,
  seedDatabaseIfEmpty,
} from '../lib/firestoreService';
import type {
  Empreendimento,
  LandingPage,
  ProfessionalProfile,
  Property,
  SiteSettings,
} from '../types/realestate';

interface SiteContextValue {
  settings: SiteSettings;
  profile: ProfessionalProfile;
  empreendimentos: Empreendimento[];
  properties: Property[];
  landingPages: LandingPage[];
  loading: boolean;
  user: User | null;
  adminEmail: string | null;
  isAdmin: boolean;
  isFirebaseAdmin: boolean;
  authReady: boolean;
  refreshPublicData: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const OWNER_ADMIN_EMAIL = 'nonhu2490@gmail.com';
const ADMIN_TOKEN_KEY = 'rm_admin_token';
const ADMIN_EMAIL_KEY = 'rm_admin_email';

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [profile, setProfile] = useState<ProfessionalProfile>(DEFAULT_PROFILE);
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>(DEFAULT_EMPREENDIMENTOS);
  const [properties, setProperties] = useState<Property[]>(DEFAULT_PROPERTIES);
  const [landingPages, setLandingPages] = useState<LandingPage[]>(DEFAULT_LANDING_PAGES);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState(false);
  const [directAdminEmail, setDirectAdminEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_EMAIL_KEY);
  });
  const [authReady, setAuthReady] = useState(true);

  const refreshPublicData = useCallback(async () => {
    try {
      const [s, p, emps, props, lps] = await Promise.all([
        fetchSiteSettings(),
        fetchProfessionalProfile(),
        fetchPublicEmpreendimentos(),
        fetchPublicProperties(),
        fetchPublicLandingPages(),
      ]);
      setSettings(s);
      setProfile(p);
      setEmpreendimentos(emps);
      setProperties(props);
      setLandingPages(lps);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPublicData();
  }, [refreshPublicData]);

  // Verify saved direct admin token on boot
  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const savedEmail = localStorage.getItem(ADMIN_EMAIL_KEY);
    if (!token) return;
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok && savedEmail) {
          setDirectAdminEmail(savedEmail);
        } else {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          localStorage.removeItem(ADMIN_EMAIL_KEY);
          setDirectAdminEmail(null);
        }
      })
      .catch(() => {
        // Ignore network check error
      });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.primaryColor) {
      root.style.setProperty('--color-brand-primary', settings.primaryColor);
    }
    if (settings.secondaryColor) {
      root.style.setProperty('--color-brand-navy', settings.secondaryColor);
    }
    if (settings.accentColor) {
      root.style.setProperty('--color-brand-gold', settings.accentColor);
    }
    if (settings.seoTitle) {
      document.title = settings.seoTitle;
    }
  }, [settings]);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
        if (!currentUser) {
          setIsFirebaseAdmin(false);
          return;
        }

        try {
          let adminVerified =
            Boolean(currentUser.emailVerified) &&
            currentUser.email?.toLowerCase() === OWNER_ADMIN_EMAIL;

          if (!adminVerified) {
            const adminDoc = await getDoc(doc(db, 'adminUsers', currentUser.uid));
            if (adminDoc.exists() && currentUser.emailVerified) {
              adminVerified = true;
            }
          }

          setIsFirebaseAdmin(adminVerified);
          if (adminVerified) {
            await seedDatabaseIfEmpty();
            await refreshPublicData();
          }
        } catch {
          setIsFirebaseAdmin(false);
        }
      },
      () => {
        setAuthReady(true);
      }
    );

    const fallbackTimer = setTimeout(() => {
      setAuthReady(true);
    }, 600);

    return () => {
      unsub();
      clearTimeout(fallbackTimer);
    };
  }, [refreshPublicData]);

  const loginWithCredentials = async (email: string, password: string) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (!res.ok) {
      // Fallback: if user configured custom Email/Password account in Firebase Console
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        return;
      } catch {
        throw new Error('E-mail ou senha inválidos.');
      }
    }

    const data = (await res.json()) as { token: string; email: string };
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    localStorage.setItem(ADMIN_EMAIL_KEY, data.email);
    setDirectAdminEmail(data.email);

    // Non-blocking attempt to also authenticate with Firebase if Email/Password is enabled in Console
    signInWithEmailAndPassword(auth, email.trim(), password).catch(() => {});
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
    setDirectAdminEmail(null);
    await signOut(auth);
  };

  const isAdmin = isFirebaseAdmin || Boolean(directAdminEmail);
  const adminEmail = user?.email || directAdminEmail;

  return (
    <SiteContext.Provider
      value={{
        settings,
        profile,
        empreendimentos,
        properties,
        landingPages,
        loading,
        user,
        adminEmail,
        isAdmin,
        isFirebaseAdmin,
        authReady,
        refreshPublicData,
        loginWithCredentials,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite must be used inside SiteProvider');
  }
  return ctx;
}
