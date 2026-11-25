import { Platform } from 'react-native';
import {
  apiRequest,
  SessionChangedError,
} from '../../../services/apiClient';
import { sessionGeneration } from '../../../services/sessionTokens';

export type AvatarResponse = {
  url: string | null;
};

const BASE = process.env.EXPO_PUBLIC_API_URL
  ?.trim()
  .replace(/\/+$/, '');

export const avatarApi = {
  get: (token: string) =>
    apiRequest<AvatarResponse>(
      '/auth/avatar',
      { token },
    ),

  remove: (token: string) =>
    apiRequest<AvatarResponse>(
      '/auth/avatar',
      {
        method: 'DELETE',
        token,
      },
    ),

  async upload(
    token: string,
    uri: string,
    mimeType = 'image/jpeg',
  ): Promise<AvatarResponse> {
    const epoch = sessionGeneration();

    function assertSession() {
      if (epoch !== sessionGeneration()) {
        throw new SessionChangedError();
      }
    }

    if (!BASE) {
      throw Error('EXPO_PUBLIC_API_URL is missing.');
    }

    if (!token) {
      throw Error('Sign in again.');
    }

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowed.includes(mimeType)) {
      throw Error('Use a JPEG, PNG or WebP photo.');
    }

    const extension =
      mimeType === 'image/png'
        ? 'png'
        : mimeType === 'image/webp'
          ? 'webp'
          : 'jpg';

    const form = new FormData();
    const abort = new AbortController();

    const timer = setTimeout(
      () => abort.abort(),
      25000,
    );

    try {
      assertSession();

      if (Platform.OS === 'web') {
        const response = await fetch(uri, {
          signal: abort.signal,
        });

        if (!response.ok) {
          throw Error('Unable to read selected photo.');
        }

        const blob = await response.blob();

        assertSession();

        if (blob.size > 3 * 1024 * 1024) {
          throw Error('Photo exceeds 3 MB.');
        }

        form.append(
          'file',
          blob,
          'avatar.' + extension,
        );
      } else {
        form.append('file', {
          uri,
          type: mimeType,
          name: 'avatar.' + extension,
        } as unknown as Blob);
      }

      assertSession();

      const response = await fetch(
        BASE + '/auth/avatar',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
            Accept: 'application/json',
          },
          body: form,
          signal: abort.signal,
        },
      );

      assertSession();

      const result: unknown =
        await response.json().catch(() => null);

      assertSession();

      if (!response.ok) {
        const error = result as {
          message?: string;
          error?: { message?: string };
        } | null;

        throw Error(
          error?.error?.message ||
          error?.message ||
          'Upload failed: HTTP ' + response.status
        );
      }

      if (
        !result ||
        typeof result !== 'object' ||
        !('url' in result) ||
        typeof result.url !== 'string'
      ) {
        throw Error('Invalid avatar response.');
      }

      return { url: result.url };
    } catch (error) {
      assertSession();

      if (abort.signal.aborted) {
        throw Error('Photo upload timed out.');
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }
  },
};