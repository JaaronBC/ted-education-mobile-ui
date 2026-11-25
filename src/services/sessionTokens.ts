import * as SecureStore from 'expo-secure-store';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type PersistedSession = {
  version: 1;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const SESSION = 'ted_session_v1';
const ACCESS = 'ted_access_token';
const REFRESH = 'ted_refresh_token';
const EXPIRY = 'ted_access_token_expires_at';

const LEGACY_KEYS = [ACCESS, REFRESH, EXPIRY];

const BASE = process.env.EXPO_PUBLIC_API_URL
  ?.trim()
  .replace(/\/+$/, '');

let generation = 0;
let terminating = false;
let cleanupFailed = false;
let queued: Promise<void> = Promise.resolve();

let refreshing: {
  epoch: number;
  task: Promise<string>;
} | null = null;

type SessionInvalidationListener =
  (epoch: number) => void;

const invalidationListeners =
  new Set<SessionInvalidationListener>();

export function subscribeSessionInvalidation(
  listener: SessionInvalidationListener,
) {
  invalidationListeners.add(listener);

  return () => {
    invalidationListeners.delete(listener);
  };
}

function notifySessionInvalidation(epoch: number) {
  for (const listener of invalidationListeners) {
    try {
      listener(epoch);
    } catch {
      console.warn('Session invalidation listener failed.');
    }
  }
}

export function sessionGeneration() {
  return generation;
}

export function beginSessionTermination() {
  generation++;
  terminating = true;
  cleanupFailed = false;
  return generation;
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

function assertEpoch(epoch: number) {
  if (epoch !== generation) {
    throw new Error('Session changed.');
  }
}

function validRecord(
  value: unknown,
): value is PersistedSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Partial<PersistedSession>;

  return (
    record.version === 1 &&
    typeof record.accessToken === 'string' &&
    record.accessToken.length > 0 &&
    typeof record.refreshToken === 'string' &&
    record.refreshToken.length > 0 &&
    typeof record.expiresAt === 'number' &&
    Number.isFinite(record.expiresAt) &&
    record.expiresAt > 0
  );
}

function createRecord(
  value: StoredSession,
): PersistedSession {
  if (
    !value.accessToken ||
    !value.refreshToken ||
    !Number.isFinite(value.expiresIn) ||
    value.expiresIn <= 0
  ) {
    throw new Error('Incomplete login session.');
  }

  const record: PersistedSession = {
    version: 1,
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
    expiresAt: Date.now() + value.expiresIn * 1000,
  };

  if (!validRecord(record)) {
    throw new Error('Invalid session record.');
  }

  return record;
}

async function removeLegacyKeys() {
  const results = await Promise.allSettled(
    LEGACY_KEYS.map(key =>
      SecureStore.deleteItemAsync(key)
    ),
  );

  if (results.some(result => result.status === 'rejected')) {
    throw new Error('Legacy session cleanup failed.');
  }
}

async function writeSignedOut() {
  await SecureStore.setItemAsync(
    SESSION,
    JSON.stringify({
      version: 1,
      signedOut: true,
    }),
  );
}

async function persistSignedOut() {
  try {
    await writeSignedOut();
  } catch {
    // If writing a tombstone fails, remove legacy
    // credentials before deleting the current record.
    await removeLegacyKeys();
    await SecureStore.deleteItemAsync(SESSION);
    return;
  }

  // A persisted tombstone blocks legacy restoration.
  await removeLegacyKeys();
}

async function finishSignedOut(epoch: number) {
  try {
    try {
      await persistSignedOut();
    } catch {
      // Retry transient storage failures once.
      await persistSignedOut();
    }

    if (epoch === generation) {
      cleanupFailed = false;
      terminating = false;
    }
  } catch {
    if (epoch === generation) {
      cleanupFailed = true;
      terminating = true;
    }

    throw new Error(
      'Local session cleanup failed. Sign in again to retry cleanup.',
    );
  }
}

async function readOrMigrate():
  Promise<PersistedSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION);

  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);

      return validRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  const [access, refresh, expiry] =
    await Promise.all([
      SecureStore.getItemAsync(ACCESS),
      SecureStore.getItemAsync(REFRESH),
      SecureStore.getItemAsync(EXPIRY),
    ]);

  const legacy = {
    version: 1,
    accessToken: access,
    refreshToken: refresh,
    expiresAt: Number(expiry),
  };

  if (!validRecord(legacy)) {
    await persistSignedOut();
    return null;
  }

  await SecureStore.setItemAsync(
    SESSION,
    JSON.stringify(legacy),
  );

  await removeLegacyKeys().catch(() => {
    console.warn('Legacy session cleanup is pending.');
  });

  return legacy;
}

async function readSession(
  allowTerminating = false,
): Promise<PersistedSession | null> {
  if (terminating && !allowTerminating) {
    return null;
  }

  const epoch = generation;

  return serialize(async () => {
    if (
      epoch !== generation ||
      (terminating && !allowTerminating)
    ) {
      return null;
    }

    const record = await readOrMigrate();

    if (
      epoch !== generation ||
      (terminating && !allowTerminating)
    ) {
      return null;
    }

    return record;
  });
}

export async function clearSessionTokens() {
  const epoch = ++generation;

  terminating = true;
  cleanupFailed = false;

  notifySessionInvalidation(epoch);

  await serialize(async () => {
    await finishSignedOut(epoch);
  });
}

export function establishSession(
  value: StoredSession,
  expectedEpoch: number,
  assertAttempt: () => void,
): Promise<{ epoch: number; expiry: number }> {
  assertAttempt();
  assertEpoch(expectedEpoch);

  if (terminating && !cleanupFailed) {
    throw new Error('Session cleanup is in progress.');
  }

  const record = createRecord(value);
  const epoch = ++generation;

  terminating = true;
  cleanupFailed = false;

  return serialize(async () => {
    try {
      assertEpoch(epoch);
      assertAttempt();

      // Invalidate the previous persisted session first.
      await persistSignedOut();

      assertEpoch(epoch);
      assertAttempt();

      await SecureStore.setItemAsync(
        SESSION,
        JSON.stringify(record),
      );

      assertEpoch(epoch);
      assertAttempt();

      terminating = false;

      return {
        epoch,
        expiry: record.expiresAt,
      };
    } catch (error) {
      if (epoch === generation) {
        terminating = true;
        await finishSignedOut(epoch);
      }

      throw error;
    }
  });
}

export async function storeSession(
  value: StoredSession,
): Promise<number> {
  const epoch = generation;

  return serialize(async () => {
    assertEpoch(epoch);

    if (terminating) {
      throw new Error('Session changed.');
    }

    try {
      const record = createRecord(value);

      await SecureStore.setItemAsync(
        SESSION,
        JSON.stringify(record),
      );

      assertEpoch(epoch);

      if (terminating) {
        throw new Error('Session changed.');
      }

      return record.expiresAt;
    } catch (error) {
      if (epoch === generation && !terminating) {
        const invalidatedEpoch = ++generation;

        terminating = true;
        notifySessionInvalidation(invalidatedEpoch);

        await finishSignedOut(invalidatedEpoch);
      }

      throw error;
    }
  });
}

export const storedAccessToken = async () =>
  (await readSession())?.accessToken ?? null;

export const storedRefreshToken = async () =>
  (await readSession())?.refreshToken ?? null;

export const storedAccessExpiry = async () =>
  (await readSession())?.expiresAt ?? 0;

export async function refreshAccessToken():
  Promise<string> {
  if (terminating) {
    throw new Error('Session is signing out.');
  }

  const epoch = generation;

  if (refreshing?.epoch === epoch) {
    return refreshing.task;
  }

  const task = (async () => {
    if (!BASE) {
      throw new Error('EXPO_PUBLIC_API_URL is not configured.');
    }

    const current = await storedRefreshToken();

    assertEpoch(epoch);

    if (!current || terminating) {
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

      assertEpoch(epoch);

      if (terminating) {
        throw new Error('Session changed.');
      }

      if (response.status === 401) {
        await clearSessionTokens();

        throw new Error(
          'Session expired. Sign in again.',
        );
      }

      if (!response.ok) {
        throw new Error('Unable to refresh session.');
      }

      const next =
        (await response.json()) as StoredSession;

      assertEpoch(epoch);

      if (terminating) {
        throw new Error('Session changed.');
      }

      await storeSession(next);

      assertEpoch(epoch);

      return next.accessToken;
    } finally {
      clearTimeout(timer);
    }
  })();

  refreshing = { epoch, task };

  try {
    return await task;
  } finally {
    if (refreshing?.task === task) {
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
  const record = await readSession();

  if (
    !record ||
    epoch !== generation ||
    terminating
  ) {
    return null;
  }

  if (record.expiresAt > Date.now() + 60000) {
    return record.accessToken;
  }

  return refreshAccessToken();
}