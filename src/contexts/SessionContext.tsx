import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import {
  createContext, useContext, useEffect, useState,
  type PropsWithChildren,
} from 'react';
import { ApiError } from '../services/apiClient';
import { authApi, type Account } from '../services/authApi';

export type UserRole =
  'anonymous' | 'patient' | 'doctor' | 'admin';

type SessionValue = {
  role: UserRole;
  user: Account | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_KEY = 'ted_access_token';
const EXPIRY_KEY = 'ted_access_token_expires_at';

const SessionContext = createContext<SessionValue | null>(null);

async function removeStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(EXPIRY_KEY);
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<Account | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const [token, savedExpiry] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(EXPIRY_KEY),
        ]);

        const expiry = Number(savedExpiry);

        if (token && savedExpiry &&
            Number.isFinite(expiry) && expiry > Date.now()) {
          const account = await authApi.me(token);

          if (active) {
            setUser(account);
            setExpiresAt(expiry);
          }
        } else if (token || savedExpiry) {
          await removeStoredSession();
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await removeStoredSession().catch(() => undefined);
        }

        if (active) {
          setUser(null);
          setExpiresAt(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void restore();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!expiresAt) return;

    const expire = () => {
      if (Date.now() >= expiresAt) {
        setUser(null);
        setExpiresAt(null);
        void removeStoredSession().catch(() => undefined);
      }
    };

    const timer = setTimeout(
      expire,
      Math.max(0, expiresAt - Date.now()),
    );

    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') expire();
    });

    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, [expiresAt]);

  async function login(email: string, password: string): Promise<void> {
    const result = await authApi.login(
      email.trim().toLowerCase(),
      password,
    );

    const account = await authApi.me(result.accessToken);
    const expiry = Date.now() + result.expiresIn * 1000;

    await SecureStore.setItemAsync(TOKEN_KEY, result.accessToken);

    try {
      await SecureStore.setItemAsync(EXPIRY_KEY, String(expiry));
    } catch (error) {
      await removeStoredSession().catch(() => undefined);
      throw error;
    }

    setUser(account);
    setExpiresAt(expiry);
  }

  async function signOut(): Promise<void> {
    await removeStoredSession();
    setUser(null);
    setExpiresAt(null);
  }

  const role: UserRole = !user ? 'anonymous'
    : user.role === 'DOCTOR' ? 'doctor'
    : user.role === 'ADMIN' ? 'admin'
    : 'patient';

  return (
    <SessionContext.Provider value={{
      role, user, loading,
      isAuthenticated: !!user,
      login, signOut,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('SessionProvider is missing.');
  }

  return context;
}