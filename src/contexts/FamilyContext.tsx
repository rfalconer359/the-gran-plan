import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getFamily } from '../services/family';
import type { Family } from '../types';

interface FamilyContextType {
  family: Family | null;
  loading: boolean;
  setActiveFamily: (family: Family | null) => void;
  refreshFamily: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType>({
  family: null,
  loading: true,
  setActiveFamily: () => {},
  refreshFamily: async () => {},
});

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshFamily = async () => {
    if (family) {
      const updated = await getFamily(family.id);
      setFamily(updated);
    }
  };

  useEffect(() => {
    async function loadFamily() {
      if (profile && profile.familyIds.length > 0) {
        const f = await getFamily(profile.familyIds[0]);
        setFamily(f);
      } else {
        setFamily(null);
      }
      setLoading(false);
    }
    loadFamily();
  }, [profile]);

  return (
    <FamilyContext.Provider
      value={{ family, loading, setActiveFamily: setFamily, refreshFamily }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
