import { AppState } from 'react-native';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { ApiError } from '../services/apiClient';
import {
  authApi,
  type Account,
  type ProfileUpdate,
  type FullLoginResponse,
} from '../services/authApi';

import {
  beginSessionTermination,
  clearSessionTokens,
  getValidAccessToken,
  sessionGeneration,
  storeSession,
  storedAccessExpiry,
  storedAccessToken,
} from '../services/sessionTokens';

export type UserRole =
  | 'anonymous'
  | 'patient'
  | 'doctor'
  | 'admin';

type FullSession = Pick<
  FullLoginResponse,
  'accessToken' | 'refreshToken' | 'expiresIn'
>;

type SessionValue = {
  role: UserRole;
  user: Account | null;
  isAuthenticated: boolean;
  loading: boolean;
  pendingMfa: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<
    'mfa' | 'onboarding' | 'authenticated'
  >;

  loginWithGoogleToken: (
    idToken: string,
  ) => Promise<
    'mfa' | 'onboarding' | 'authenticated'
  >;

  completeMfa: (
    code: string,
  ) => Promise<'onboarding' | 'authenticated'>;

  updateAccountProfile: (
    body: ProfileUpdate,
  ) => Promise<Account>;

  cancelMfa: () => void;
  getToken: () => Promise<string | null>;
  replaceSession: (value: FullSession) => Promise<void>;
  signOut: () => Promise<void>;
  signOutAll: () => Promise<void>;
  clearLocalSession: () => Promise<void>;
};

const SessionContext =
  createContext<SessionValue | null>(null);

const getToken = getValidAccessToken;

export function SessionProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] =
    useState<Account | null>(null);

  const [expiresAt, setExpiresAt] =
    useState<number | null>(null);

  const [pendingChallenge, setPendingChallenge] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  async function restore() {
    const epoch = sessionGeneration();

    try {
      const token = await getToken();

      if (epoch !== sessionGeneration()) return;

      if (!token) {
        setUser(null);
        setExpiresAt(null);
        return;
      }

      const account = await authApi.me(token);

      if (epoch !== sessionGeneration()) return;

      setUser(account);
      setExpiresAt(await storedAccessExpiry());
    } catch (error) {
      if (epoch !== sessionGeneration()) {
        // A rejected refresh may have cleared credentials.
        // Never erase a newer login session.
        if (
          !await storedAccessToken().catch(() => null)
        ) {
          setUser(null);
          setExpiresAt(null);
        }
        return;
      }

      if (
        (error instanceof ApiError &&
          error.status === 401) ||
        (error instanceof Error &&
          error.message.includes('Sign in again'))
      ) {
        await clearSessionTokens()
          .catch(() => undefined);

        setUser(null);
        setExpiresAt(null);
      }
    }
  }

  useEffect(() => {
    let active = true;
    const epoch = sessionGeneration();

    async function begin() {
      try {
        const token = await getToken();

        if (
          !token ||
          epoch !== sessionGeneration() ||
          !active
        ) {
          return;
        }

        const account = await authApi.me(token);

        if (
          !active ||
          epoch !== sessionGeneration()
        ) {
          return;
        }

        setUser(account);
        setExpiresAt(await storedAccessExpiry());
      } catch (error) {
        if (
          active &&
          epoch === sessionGeneration() &&
          error instanceof ApiError &&
          error.status === 401
        ) {
          await clearSessionTokens()
            .catch(() => undefined);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void begin();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!expiresAt) return;

    const renew = () => {
      void restore();
    };

    const timer = setTimeout(
      renew,
      Math.max(
        0,
        expiresAt - Date.now() - 60000,
      ),
    );

    const listener = AppState.addEventListener(
      'change',
      state => {
        if (state === 'active') {
          renew();
        }
      },
    );

    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, [expiresAt]);

  async function applyLoginResult(
    result: FullSession,
  ): Promise<Account> {
    const epoch = sessionGeneration();

    const account = await authApi.me(
      result.accessToken,
    );

    if (epoch !== sessionGeneration()) {
      throw new Error('Session changed.');
    }

    const expiry = await storeSession(result);

    if (epoch !== sessionGeneration()) {
      throw new Error('Session changed.');
    }

    setUser(account);
    setExpiresAt(expiry);
    setPendingChallenge(null);

    return account;
  }

  async function handleFirstFactor(
    result: Awaited<
      ReturnType<typeof authApi.login>
    >,
  ): Promise<
    'mfa' | 'onboarding' | 'authenticated'
  > {
    if (result.mfaRequired) {
      setPendingChallenge(
        result.challengeToken,
      );

      return 'mfa';
    }

    const account =
      await applyLoginResult(result);

    return account.onboardingCompletedAt
      ? 'authenticated'
      : 'onboarding';
  }

  async function login(
    email: string,
    password: string,
  ) {
    const result = await authApi.login(
      email.trim().toLowerCase(),
      password,
    );

    return handleFirstFactor(result);
  }

  async function loginWithGoogleToken(
    idToken: string,
  ) {
    const result =
      await authApi.googleLogin(idToken);

    return handleFirstFactor(result);
  }

  async function completeMfa(code: string) {
    if (!pendingChallenge) {
      throw new Error(
        'Sign in again to verify 2FA.',
      );
    }

    const result = await authApi.mfaVerify(
      pendingChallenge,
      code,
    );

    const account =
      await applyLoginResult(result);

    return account.onboardingCompletedAt
      ? 'authenticated'
      : 'onboarding';
  }

  async function updateAccountProfile(
    body: ProfileUpdate,
  ) {
    const token = await getToken();

    if (!token) {
      throw Error(
        'Sign in to save your profile.',
      );
    }

    const next =
      await authApi.updateProfile(token, body);

    setUser(next);
    return next;
  }

  function cancelMfa() {
    setPendingChallenge(null);
  }

  async function clearLocalSession() {
    // Server already revoked every session.
    // Never attempt another remote logout here.
    beginSessionTermination();

    setUser(null);
    setExpiresAt(null);
    setPendingChallenge(null);

    await clearSessionTokens();
  }

  async function signOut() {
    const accessPending =
      getToken().catch(() => null);

    beginSessionTermination();

    setUser(null);
    setExpiresAt(null);
    setPendingChallenge(null);

    try {
      const access =
        (await accessPending) ||
        await storedAccessToken();

      if (!access) {
        throw new Error('No valid access token.');
      }

      await authApi.logout(access);
    } catch {
      console.warn(
        'Remote sign-out could not be confirmed.',
      );
    } finally {
      await clearSessionTokens();
    }
  }

  async function signOutAll() {
    // Confirm server revocation before clearing local credentials.
    const access = await getToken();

    if (!access) {
      throw new Error('Cannot verify your session. Sign in again and retry.');
    }

    await authApi.logoutAll(access);

    beginSessionTermination();
    setUser(null);
    setExpiresAt(null);
    setPendingChallenge(null);
    await clearSessionTokens();
  }

  const role: UserRole = !user
    ? 'anonymous'
    : user.role === 'DOCTOR'
      ? 'doctor'
      : user.role === 'ADMIN'
        ? 'admin'
        : 'patient';

  return (
    <SessionContext.Provider
      value={{
        role,
        user,
        loading,
        isAuthenticated: !!user,
        pendingMfa: Boolean(pendingChallenge),
        login,
        loginWithGoogleToken,
        completeMfa,
        cancelMfa,
        getToken,
        replaceSession: async value => {
          await applyLoginResult(value);
        },
        updateAccountProfile,
        signOut,
        signOutAll,
        clearLocalSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      'SessionProvider is missing.',
    );
  }

  return context;
}
