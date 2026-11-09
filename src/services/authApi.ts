import { apiRequest } from './apiClient';

export type Account = {
  id: string;
  email: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY' | null;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  preferredLanguage: 'en' | 'zh' | 'ja' | 'ko' | 'es';
  fontScale: number;
  highContrast: boolean;
  onboardingStep: number;
  onboardingCompletedAt: string | null;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  gender?: Exclude<Account['gender'], null>;
};

export type MfaLoginResponse = { mfaRequired: true; challengeToken: string };
export type FullLoginResponse = { mfaRequired: false; accessToken: string; tokenType: 'Bearer'; expiresIn: number };
export type LoginResponse = MfaLoginResponse | FullLoginResponse;

export type ProfileUpdate = {
  fullName?: string;
  gender?: Exclude<Account['gender'],null>;
  preferredLanguage?: Account['preferredLanguage'];
  fontScale?: number;
  highContrast?: boolean;
  onboardingStep?: number;
  completeOnboarding?: boolean;
};
export const authApi = {
  updateProfile: (token: string, body: ProfileUpdate) =>
    apiRequest<Account>('/auth/profile', {
      method: 'PATCH', token, body
    }),
  mfaStatus: (token: string) =>
    apiRequest<{ enabled: boolean; recoveryCodesRemaining: number }>('/auth/mfa/status', { token }),
  mfaSetup: (token: string) =>
    apiRequest<{ secret: string; uri: string }>('/auth/mfa/setup', { method: 'POST', token }),
  mfaEnable: (token: string, code: string) =>
    apiRequest<FullLoginResponse & { recoveryCodes: string[] }>('/auth/mfa/enable', { method: 'POST', token, body: { code } }),
  mfaDisable: (token: string, code: string) =>
    apiRequest<FullLoginResponse>('/auth/mfa/disable', { method: 'POST', token, body: { code } }),
  mfaVerify: (challengeToken: string, code: string) =>
    apiRequest<FullLoginResponse>('/auth/mfa/verify', { method: 'POST', body: { challengeToken, code } }),
  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { email, code, newPassword },
    }),
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  googleLogin: (idToken: string) =>
    apiRequest<LoginResponse>('/auth/google', {
      method: 'POST',
      body: { idToken },
    }),

  me: (token: string) =>
    apiRequest<Account>('/auth/me', { token }),

  register: (input: RegisterInput) =>
    apiRequest<Account>('/auth/register', {
      method: 'POST',
      body: input,
    }),
};