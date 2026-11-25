import { apiRequest } from '../../../services/apiClient';

export type AccountDataExport = {
  formatVersion: 1 | 2;
  exportedAt: string;
  scope: 'account-data-only';

  limits?: {
    maximumSessions: number;
    maximumSecurityEvents: number;
    securityEventWindowDays: number;
  };

  account: Record<string, unknown>;

  connectedAccounts: {
    provider: string;
    createdAt: string;
  }[];

  security: {
    mfaEnabled: boolean;
    mfaEnabledAt: string | null;

    sessions: {
      createdAt: string;
      updatedAt: string;
      expiresAt: string;
      absoluteExpiresAt: string;
      revokedAt: string | null;
      devicePlatform?: string | null;
      lastActiveAt?: string | null;
    }[];

    recentEvents: {
      type: string;
      createdAt: string;
    }[];
  };

  completeness: {
    sessionsTruncated: boolean;
    eventsTruncated: boolean;
    medicalRecordsIncluded: boolean;
    avatarFileIncluded: boolean;
  };
};

export const accountDataApi = {
  exportAccount(
    token: string,
    currentPassword: string,
    mfaCode?: string,
  ) {
    return apiRequest<AccountDataExport>(
      '/auth/account-data/export',
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

  deleteAccount(
    token: string,
    currentPassword: string,
    confirmation: string,
    mfaCode?: string,
  ) {
    return apiRequest<{
      accountDeleted: boolean;
      avatarCleanupQueued: boolean;
      message: string;
    }>('/auth/account-data/delete', {
      method: 'POST',
      token,
      body: {
        currentPassword,
        confirmation,
        ...(mfaCode ? { mfaCode } : {}),
      },
    });
  },
};
