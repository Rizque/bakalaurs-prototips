import { authService } from '@/services/auth';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CHOICE_KEY = 'biometric_choice_made';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  biometricEnabled: boolean;
  biometricChoiceMade: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  setBiometricEnabled: (value: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricChoiceMade, setBiometricChoiceMade] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [{ data }, enabledRaw, choiceRaw] = await Promise.all([
        supabase.auth.getSession(),
        SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY),
        SecureStore.getItemAsync(BIOMETRIC_CHOICE_KEY),
      ]);

      if (cancelled) return;

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setBiometricEnabledState(enabledRaw === 'true');
      setBiometricChoiceMade(choiceRaw === 'true');
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const setBiometricEnabled = async (value: boolean) => {
    await SecureStore.setItemAsync(
      BIOMETRIC_ENABLED_KEY,
      value ? 'true' : 'false'
    );
    await SecureStore.setItemAsync(BIOMETRIC_CHOICE_KEY, 'true');
    setBiometricEnabledState(value);
    setBiometricChoiceMade(true);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        biometricEnabled,
        biometricChoiceMade,
        signUp: authService.signUp,
        signIn: authService.signIn,
        signOut: authService.signOut,
        resetPassword: authService.resetPassword,
        setBiometricEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth jāizmanto AuthProvider iekšienē');
  }
  return context;
}
