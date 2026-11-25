import { apiRequest } from '../../../services/apiClient';

export type AccountSession = {
  id: string;
  current: boolean;
  createdAt: string;
  lastUpdatedAt: string;
  lastActiveAt?: string | null;
  devicePlatform?: string | null;
  expiresAt: string;
};

export type SessionListResponse = {
  sessions: AccountSession[];
  hasMore: boolean;
};

export const sessionApi = {
  list(token: string) {
    return apiRequest<SessionListResponse>(
      '/auth/sessions',
      { token },
    );
  },

  revoke(token: string, id: string) {
    return apiRequest<{ message: string }>(
      '/auth/sessions/' + encodeURIComponent(id),
      {
        method: 'DELETE',
        token,
      },
    );
  },
};
