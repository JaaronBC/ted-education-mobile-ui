import { apiRequest } from '../../../services/apiClient';

export const emailChangeApi = {
  request(
    token: string,
    newEmail: string,
    currentPassword: string,
    mfaCode?: string,
  ) {
    return apiRequest<{
      requestId: string;
      expiresAt: string;
      message: string;
    }>('/auth/email-change/request', {
      method: 'POST',
      token,
      body: {
        newEmail,
        currentPassword,
        ...(mfaCode ? { mfaCode } : {}),
      },
    });
  },

  confirm(
    token: string,
    requestId: string,
    oldCode: string,
    newCode: string,
  ) {
    return apiRequest<{ message: string }>(
      '/auth/email-change/confirm',
      {
        method: 'POST',
        token,
        body: {
          requestId,
          oldCode,
          newCode,
        },
      },
    );
  },
};