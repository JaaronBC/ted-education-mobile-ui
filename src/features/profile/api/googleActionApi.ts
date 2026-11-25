import { apiRequest } from '../../../services/apiClient';
import type { AccountDataExport } from './accountDataApi';

export type GoogleSensitiveAction =
  | 'SET_PASSWORD'
  | 'EXPORT_DATA'
  | 'DELETE_ACCOUNT';

export type GoogleActionChallenge = {
  requestId: string;
  expiresAt: string;
  message: string;
};

export type GoogleActionProof = {
  requestId: string;
  emailCode: string;
  mfaCode?: string;
};

export const googleActionApi = {
  request(
    token: string,
    action: GoogleSensitiveAction,
    idToken: string,
  ) {
    const isPassword = action === 'SET_PASSWORD';

    const endpoint = isPassword
      ? '/auth/connected-accounts/google/challenge'
      : '/auth/account-data/google/challenge';

    return apiRequest<GoogleActionChallenge>(
      endpoint,
      {
        method: 'POST',
        token,
        body: isPassword
          ? { idToken }
          : { idToken, action },
      },
    );
  },

  setPassword(
    token: string,
    newPassword: string,
    proof: GoogleActionProof,
  ) {
    return apiRequest<{ message: string }>(
      '/auth/connected-accounts/google/set-password',
      {
        method: 'POST',
        token,
        body: {
          newPassword,
          requestId: proof.requestId,
          emailCode: proof.emailCode,
          ...(proof.mfaCode
            ? { mfaCode: proof.mfaCode }
            : {}),
        },
      },
    );
  },

  exportAccount(
    token: string,
    proof: GoogleActionProof,
  ) {
    return apiRequest<AccountDataExport>(
      '/auth/account-data/google/export',
      {
        method: 'POST',
        token,
        body: {
          requestId: proof.requestId,
          emailCode: proof.emailCode,
          ...(proof.mfaCode
            ? { mfaCode: proof.mfaCode }
            : {}),
        },
      },
    );
  },

  deleteAccount(
    token: string,
    confirmation: string,
    proof: GoogleActionProof,
  ) {
    return apiRequest<{
      accountDeleted: boolean;
      avatarCleanupQueued: boolean;
      message: string;
    }>(
      '/auth/account-data/google/delete',
      {
        method: 'POST',
        token,
        body: {
          confirmation,
          requestId: proof.requestId,
          emailCode: proof.emailCode,
          ...(proof.mfaCode
            ? { mfaCode: proof.mfaCode }
            : {}),
        },
      },
    );
  },
};
