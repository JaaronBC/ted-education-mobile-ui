import { AppState } from 'react-native';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  establishSession,
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
  const renderedSessionGeneration = sessionGeneration();
  const loginAttempt = useRef(0);

  function assertLoginAttempt(
    epoch: number,
    attempt: number,
  ) {
    if (
      epoch !== sessionGeneration() ||
      attempt !== loginAttempt.current
    ) {
      throw new Error('Login attempt is no longer active.');
    }
  }

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

      const expiry = await storedAccessExpiry();

      if (epoch !== sessionGeneration()) return;

      setUser(account);
      setExpiresAt(expiry);
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

        const expiry = await storedAccessExpiry();

        if (!active || epoch !== sessionGeneration()) {
          return;
        }

        setUser(account);
        setExpiresAt(expiry);
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
    epoch: number,
    attempt: number,
  ): Promise<Account> {
    assertLoginAttempt(epoch, attempt);

    const account = await authApi.me(
      result.accessToken,
    );

    assertLoginAttempt(epoch, attempt);

    const pending = establishSession(
      result,
      epoch,
      () => {
        if (attempt !== loginAttempt.current) {
          throw new Error(
            'Login attempt is no longer active.',
          );
        }
      },
    );

    setUser(null);
    setExpiresAt(null);

    const committed = await pending;

    assertLoginAttempt(
      committed.epoch,
      attempt,
    );

    setUser(account);
    setExpiresAt(committed.expiry);
    setPendingChallenge(null);

    return account;
  }

  async function handleFirstFactor(
    result: Awaited<
      ReturnType<typeof authApi.login>
    >,
    epoch: number,
    attempt: number,
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
      await applyLoginResult(result, epoch, attempt);

    return account.onboardingCompletedAt
      ? 'authenticated'
      : 'onboarding';
  }

  async function login(
    email: string,
    password: string,
  ) {
    const epoch = sessionGeneration();
    const attempt = ++loginAttempt.current;

    setPendingChallenge(null);

    const result = await authApi.login(
      email.trim().toLowerCase(),
      password,
    );

    assertLoginAttempt(epoch, attempt);

    return handleFirstFactor(result, epoch, attempt);
  }

  async function loginWithGoogleToken(
    idToken: string,
  ) {
    const epoch = sessionGeneration();
    const attempt = ++loginAttempt.current;

    setPendingChallenge(null);

    const result =
      await authApi.googleLogin(idToken);

    assertLoginAttempt(epoch, attempt);

    return handleFirstFactor(result, epoch, attempt);
  }

  async function completeMfa(code: string) {
    if (!pendingChallenge) {
      throw new Error(
        'Sign in again to verify 2FA.',
      );
    }

    const epoch = sessionGeneration();
    const attempt = ++loginAttempt.current;

    const result = await authApi.mfaVerify(
      pendingChallenge,
      code,
    );

    assertLoginAttempt(epoch, attempt);

    const account =
      await applyLoginResult(result, epoch, attempt);

    return account.onboardingCompletedAt
      ? 'authenticated'
      : 'onboarding';
  }

  async function updateAccountProfile(
    body: ProfileUpdate,
  ): Promise<Account> {
    const epoch = renderedSessionGeneration;
    const accountId = user?.id;

    function assertCurrentSession() {
      if (epoch !== sessionGeneration()) {
        throw new Error(
          'Session changed. Please try again.',
        );
      }
    }

    assertCurrentSession();

    if (!accountId) {
      throw new Error(
        'Sign in to save your profile.',
      );
    }

    const token = await getToken();

    assertCurrentSession();

    if (!token) {
      throw new Error(
        'Sign in to save your profile.',
      );
    }

    const next =
      await authApi.updateProfile(token, body);

    assertCurrentSession();

    if (next.id !== accountId) {
      throw new Error(
        'Account mismatch. Please sign in again.',
      );
    }

    setUser(current => {
      if (
        epoch !== sessionGeneration() ||
        current?.id !== accountId
      ) {
        return current;
      }

      return next;
    });

    return next;
  }

  function cancelMfa() {
    loginAttempt.current++;
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
    if (
      renderedSessionGeneration !==
      sessionGeneration()
    ) {
      return;
    }

    loginAttempt.current++;

    const accessPending =
      getToken().catch(() => null);

    const epoch = beginSessionTermination();

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

      if (epoch !== sessionGeneration()) {
        return;
      }

      await authApi.logout(access);
    } catch {
      console.warn(
        'Remote sign-out could not be confirmed.',
      );
    } finally {
      if (epoch === sessionGeneration()) {
        await clearSessionTokens();
      }
    }
  }

  async function signOutAll() {
    const epoch = renderedSessionGeneration;

    if (epoch !== sessionGeneration()) {
      throw new Error('Session changed.');
    }

    const access = await getToken();

    if (epoch !== sessionGeneration()) {
      throw new Error('Session changed.');
    }

    if (!access) {
      throw new Error('Cannot verify your session. Sign in again and retry.');
    }

    await authApi.logoutAll(access);

    if (epoch !== sessionGeneration()) {
      throw new Error('Session changed.');
    }

    loginAttempt.current++;
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
          const epoch = renderedSessionGeneration;
          const attempt = ++loginAttempt.current;

          await applyLoginResult(
            value,
            epoch,
            attempt,
          );
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
