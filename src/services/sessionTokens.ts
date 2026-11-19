import * as SecureStore from 'expo-secure-store';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

const ACCESS = 'ted_access_token';
const REFRESH = 'ted_refresh_token';
const EXPIRY = 'ted_access_token_expires_at';

const BASE = process.env.EXPO_PUBLIC_API_URL
  ?.trim()
  .replace(/\/+$/, '');

let generation = 0;
let terminating = false;

let refreshing: Promise<string> | null = null;
let queued: Promise<void> = Promise.resolve();

export function sessionGeneration() {
  return generation;
}

export function beginSessionTermination() {
  generation++;
  terminating = true;
}

function serialize<T>(
  fn: () => Promise<T>,
): Promise<T> {
  const task = queued.then(fn, fn);

  queued = task.then(
    () => undefined,
    () => undefined,
  );

  return task;
}

export async function clearSessionTokens() {
  generation++;
  terminating = true;

  await serialize(async () => {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
    await SecureStore.deleteItemAsync(EXPIRY);
  });

  terminating = false;
}

export async function storeSession(
  value: StoredSession,
): Promise<number> {
  if (
    !value.accessToken ||
    !value.refreshToken ||
    !Number.isFinite(value.expiresIn) ||
    value.expiresIn <= 0
  ) {
    throw new Error('Incomplete login session.');
  }

  const at = generation;

  const expiry =
    Date.now() + value.expiresIn * 1000;

  return serialize(async () => {
    if (at !== generation || terminating) {
      throw new Error('Session changed.');
    }

    await SecureStore.setItemAsync(
      REFRESH,
      value.refreshToken,
    );

    await SecureStore.setItemAsync(
      ACCESS,
      value.accessToken,
    );

    await SecureStore.setItemAsync(
      EXPIRY,
      String(expiry),
    );

    if (at !== generation || terminating) {
      throw new Error('Session changed.');
    }

    return expiry;
  });
}

export const storedRefreshToken = () =>
  SecureStore.getItemAsync(REFRESH);

export const storedAccessToken = () =>
  SecureStore.getItemAsync(ACCESS);

export const storedAccessExpiry = async () =>
  Number(
    await SecureStore.getItemAsync(EXPIRY),
  );

export async function refreshAccessToken():
  Promise<string> {
  if (terminating) {
    throw new Error('Session is signing out.');
  }

  if (refreshing) {
    return refreshing;
  }

  const epoch = generation;

  const task = (async () => {
    if (!BASE) {
      throw new Error(
        'EXPO_PUBLIC_API_URL is not configured.',
      );
    }

    const current =
      await storedRefreshToken();

    if (
      !current ||
      epoch !== generation ||
      terminating
    ) {
      throw new Error('Sign in again.');
    }

    const controller = new AbortController();

    const timer = setTimeout(
      () => controller.abort(),
      12000,
    );

    try {
      const response = await fetch(
        BASE + '/auth/refresh',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            refreshToken: current,
          }),
          signal: controller.signal,
        },
      );

      if (epoch !== generation || terminating) {
        throw new Error('Session changed.');
      }

      if (response.status === 401) {
        await clearSessionTokens();

        throw new Error(
          'Session expired. Sign in again.',
        );
      }

      if (!response.ok) {
        throw new Error(
          'Unable to refresh session.',
        );
      }

      const next =
        (await response.json()) as StoredSession;

      if (epoch !== generation || terminating) {
        throw new Error('Session changed.');
      }

      await storeSession(next);

      if (epoch !== generation || terminating) {
        throw new Error('Session changed.');
      }

      return next.accessToken;
    } finally {
      clearTimeout(timer);
    }
  })();

  refreshing = task;

  try {
    return await task;
  } finally {
    if (refreshing === task) {
      refreshing = null;
    }
  }
}

export async function getValidAccessToken():
  Promise<string | null> {
  if (terminating) {
    return null;
  }

  const epoch = generation;

  const [access, expiry, refresh] =
    await Promise.all([
      storedAccessToken(),
      storedAccessExpiry(),
      storedRefreshToken(),
    ]);

  if (epoch !== generation || terminating) {
    return null;
  }

  if (
    access &&
    Number.isFinite(expiry) &&
    expiry > Date.now() + 60000
  ) {
    return access;
  }

  if (refresh) {
    return refreshAccessToken();
  }

  return null;
}
