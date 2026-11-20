import { getValidAccessToken, refreshAccessToken, storedAccessToken } from './sessionTokens';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  if (!path.startsWith('/')) {
    throw new Error('API paths must start with /.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    let token = options.token;

    const mayRefresh = Boolean(
      token && token === await storedAccessToken()
    );

    if (mayRefresh) {
      token = (await getValidAccessToken()) ?? token;
    }

    const send = (authToken?: string) =>
      fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...(authToken
          ? { Authorization: `Bearer ${authToken}` }
          : {}),
      },
      body: options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
      signal: controller.signal,
    });

    let response = await send(token);

    if (
      response.status === 401 &&
      token &&
      mayRefresh &&
      !path.startsWith('/auth/refresh') &&
      !path.startsWith('/auth/logout')
    ) {
      const next = await refreshAccessToken();
      response = await send(next);
    }

    const raw = await response.text();
    let data: unknown = null;

    if (raw) {
      try {
        data = JSON.parse(raw) as unknown;
      } catch {
        data = raw;
      }
    }

    if (!response.ok) {
      let message = `Request failed (HTTP ${response.status}).`;

      if (typeof data === 'object' && data !== null &&
          'message' in data) {
        const detail = (data as { message?: unknown }).message;

        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.filter(
            (v) => typeof v === 'string',
          ).join('; ') || message;
        }
      }

      throw new ApiError(response.status, message);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new Error('Request timed out.');
    }

    throw new Error(
      'Unable to connect to the API. Check the network and server.',
    );
  } finally {
    clearTimeout(timeout);
  }
}