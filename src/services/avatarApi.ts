
import { Platform } from 'react-native';
import { apiRequest } from './apiClient';

export type AvatarResponse = { url: string | null };

const BASE = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

export const avatarApi = {
  get: (token: string) =>
    apiRequest<AvatarResponse>('/auth/avatar', { token }),

  remove: (token: string) =>
    apiRequest<AvatarResponse>('/auth/avatar', {
      method: 'DELETE',
      token
    }),

  async upload(token: string, uri: string): Promise<AvatarResponse> {
    if (!BASE) throw Error('EXPO_PUBLIC_API_URL is missing.');

    const form = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      form.append('file', await response.blob(), 'avatar.jpg');
    } else {
      form.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg'
      } as unknown as Blob);
    }

    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 25000);

    try {
      const response = await fetch(BASE + '/auth/avatar', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          Accept: 'application/json'
        },
        body: form,
        signal: abort.signal
      });

      const result: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const e = result as {
          message?: string;
          error?: { message?: string }
        } | null;

        throw Error(
          e?.error?.message ||
          e?.message ||
          'Upload failed: HTTP ' + response.status
        );
      }

      return result as AvatarResponse;
    } finally {
      clearTimeout(timer);
    }
  }
};
