import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile } from '../services/auth';
import type { UserProfile } from '../types';
import { Spinner } from '../components/ui/Spinner';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  realProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  impersonate: (profile: UserProfile) => void;
  clearImpersonation: () => void;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  realProfile: null,
  loading: true,
  refreshProfile: async () => {},
  impersonate: () => {},
  clearImpersonation: () => {},
  isImpersonating: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [realProfile, setRealProfile] = useState<UserProfile | null>(null);
  const [impersonatedProfile, setImpersonatedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const profile = impersonatedProfile ?? realProfile;
  const isImpersonating = impersonatedProfile !== null;

  const impersonate = useCallback((p: UserProfile) => {
    setImpersonatedProfile(p);
  }, []);

  const clearImpersonation = useCallback(() => {
    setImpersonatedProfile(null);
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setRealProfile(p);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        let p = await getUserProfile(firebaseUser.uid);
        // Retry once — during signup the Firestore doc may not exist yet
        // because onAuthStateChanged fires before setDoc completes
        if (!p) {
          await new Promise((r) => setTimeout(r, 1500));
          p = await getUserProfile(firebaseUser.uid);
        }
        setRealProfile(p);
      } else {
        setRealProfile(null);
        setImpersonatedProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-xl text-warm-600">Loading The Gran Plan...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        realProfile,
        loading,
        refreshProfile,
        impersonate,
        clearImpersonation,
        isImpersonating,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
