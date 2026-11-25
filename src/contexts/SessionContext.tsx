import { AppState } from 'react-native';
import {
  createContext,
  useCallback,
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
  subscribeSessionInvalidation,
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
  replaceSession: (value: FullSession) => Promise<number>;
  signOut: () => Promise<{ remoteRevoked: boolean; epoch: number }>;
  signOutAll: () => Promise<number>;
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

  const profileRevision = useRef(0);

  const profileQueue = useRef<{
    epoch: number;
    tail: Promise<void>;
  }>({
    epoch: -1,
    tail: Promise.resolve(),
  });
  const accountId = user?.id;

  const getSessionToken = useCallback(async () => {
    const epoch = renderedSessionGeneration;

    if (
      !accountId ||
      epoch !== sessionGeneration()
    ) {
      return null;
    }

    const token = await getValidAccessToken();

    if (epoch !== sessionGeneration()) {
      return null;
    }

    return token;
  }, [accountId, renderedSessionGeneration]);

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

  useEffect(() => {
    return subscribeSessionInvalidation(epoch => {
      if (epoch !== sessionGeneration()) return;

      loginAttempt.current++;

      setUser(null);
      setExpiresAt(null);
      setPendingChallenge(null);
    });
  }, []);

  async function restore() {
    const epoch = sessionGeneration();
    const revision = profileRevision.current;

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

      if (revision === profileRevision.current) {
        setUser(account);
      }

      setExpiresAt(expiry);
    } catch (error) {
      if (epoch !== sessionGeneration()) {
        return;
      }

      if (
        (error instanceof ApiError &&
          error.status === 401) ||
        (error instanceof Error &&
          error.message.includes('Sign in again'))
      ) {
        await clearSessionTokens().catch(() => {
          console.warn('Local session cleanup failed.');
        });
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
    expectedOwner?: string,
  ): Promise<{ account: Account; epoch: number }> {
    assertLoginAttempt(epoch, attempt);

    const account = await authApi.me(
      result.accessToken,
    );

    assertLoginAttempt(epoch, attempt);

    if (expectedOwner && account.id !== expectedOwner) {
      throw new Error('Replacement session belongs to another account.');
    }

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

    try {
      assertLoginAttempt(
        committed.epoch,
        attempt,
      );
    } catch (error) {
      if (committed.epoch === sessionGeneration()) {
        await clearSessionTokens();
      }

      throw error;
    }

    setUser(account);
    setExpiresAt(committed.expiry);
    setPendingChallenge(null);

    return {
      account,
      epoch: committed.epoch,
    };
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

    const { account } =
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

    const { account } =
      await applyLoginResult(result, epoch, attempt);

    return account.onboardingCompletedAt
      ? 'authenticated'
      : 'onboarding';
  }

  const updateAccountProfile = useCallback(
    (body: ProfileUpdate): Promise<Account> => {
      const epoch = renderedSessionGeneration;
      const owner = accountId;

      if (
        !owner ||
        epoch !== sessionGeneration()
      ) {
        return Promise.reject(
          new Error('Sign in to save your profile.'),
        );
      }

      if (profileQueue.current.epoch !== epoch) {
        profileQueue.current = {
          epoch,
          tail: Promise.resolve(),
        };
      }

      const queue = profileQueue.current;

      // Capture the submitted values, rather than
      // retaining a mutable form object.
      const submitted = { ...body };

      function assertCurrent() {
        if (epoch !== sessionGeneration()) {
          throw new Error(
            'Session changed. Please try again.',
          );
        }
      }

      const task = queue.tail.then(async () => {
        assertCurrent();

        profileRevision.current++;

        try {
          const token = await getSessionToken();

          assertCurrent();

          if (!token) {
            throw new Error(
              'Sign in to save your profile.',
            );
          }

          const next = await authApi.updateProfile(
            token,
            submitted,
          );

          assertCurrent();

          if (next.id !== owner) {
            throw new Error(
              'Account mismatch. Please sign in again.',
            );
          }

          setUser(current => {
            if (
              epoch !== sessionGeneration() ||
              current?.id !== owner
            ) {
              return current;
            }

            return next;
          });

          return next;

        } finally {
          profileRevision.current++;
        }
      });

      // A failed update must not block subsequent updates.
      queue.tail = task.then(
        () => undefined,
        () => undefined,
      );

      return task;
    },
    [
      accountId,
      renderedSessionGeneration,
      getSessionToken,
    ],
  );

  function cancelMfa() {
    loginAttempt.current++;
    setPendingChallenge(null);
  }

  async function clearLocalSession() {
    if (
      renderedSessionGeneration !== sessionGeneration()
    ) {
      throw new Error('Session changed.');
    }

    loginAttempt.current++;

    beginSessionTermination();

    setUser(null);
    setExpiresAt(null);
    setPendingChallenge(null);

    await clearSessionTokens();
  }

  async function signOut() {
    const originalEpoch = renderedSessionGeneration;

    if (originalEpoch !== sessionGeneration()) {
      throw new Error('Session changed.');
    }

    loginAttempt.current++;

    // Capture only the current session's access token.
    const access = await storedAccessToken()
      .catch(() => null);

    if (originalEpoch !== sessionGeneration()) {
      throw new Error('Session changed.');
    }

    // Local cleanup starts before any network operation.
    const cleanup = clearSessionTokens();
    const epoch = sessionGeneration();

    setUser(null);
    setExpiresAt(null);
    setPendingChallenge(null);

    await cleanup;

    let remoteRevoked = false;

    if (
      access &&
      epoch === sessionGeneration()
    ) {
      try {
        await authApi.logout(access);
        remoteRevoked = true;
      } catch {
        console.warn(
          'Remote sign-out could not be confirmed.',
        );
      }
    }

    return {
      remoteRevoked,
      epoch,
    };
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
    const cleanup = clearSessionTokens();
    const clearedEpoch = sessionGeneration();

    await cleanup;

    if (clearedEpoch !== sessionGeneration()) {
      throw new Error('Session changed.');
    }

    return clearedEpoch;
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
        getToken: getSessionToken,
        replaceSession: async value => {
          const epoch = renderedSessionGeneration;
          const owner = user?.id;

          if (!owner || epoch !== sessionGeneration()) {
            throw new Error('Session changed.');
          }

          const attempt = ++loginAttempt.current;

          const committed = await applyLoginResult(
            value,
            epoch,
            attempt,
            owner,
          );

          if (committed.epoch !== sessionGeneration()) {
            throw new Error('Session changed.');
          }

          return committed.epoch;
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
