import { apiRequest } from '../../../services/apiClient';

export type ConnectedAccountsResponse = {
  hasPassword: boolean;
  canManageConnections: boolean;
  canSetPassword: boolean;
  providers: {
    provider: 'GOOGLE' | 'APPLE' | 'FACEBOOK';
    createdAt: string;
  }[];
};

export const connectedAccountsApi = {
  list(token: string) {
    return apiRequest<ConnectedAccountsResponse>(
      '/auth/connected-accounts',
      { token },
    );
  },

  linkGoogle(
    token: string,
    idToken: string,
    currentPassword: string,
    mfaCode?: string,
  ) {
    return apiRequest<{ message: string }>(
      '/auth/connected-accounts/google/link',
      {
        method: 'POST',
        token,
        body: {
          idToken,
          currentPassword,
          ...(mfaCode ? { mfaCode } : {}),
        },
      },
    );
  },

  unlinkGoogle(
    token: string,
    currentPassword: string,
    mfaCode?: string,
  ) {
    return apiRequest<{ message: string }>(
      '/auth/connected-accounts/google/unlink',
      {
        method: 'POST',
        token,
        body: {
          currentPassword,
          ...(mfaCode ? { mfaCode } : {}),
        },
      },
    );
  },

};