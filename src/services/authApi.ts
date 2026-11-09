import { apiRequest } from './apiClient';

export type Account = {
  id: string;
  email: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'PREFER_NOT_TO_SAY' | null;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
};

export type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  gender?: Exclude<Account['gender'], null>;
};

type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  me: (token: string) =>
    apiRequest<Account>('/auth/me', { token }),

  register: (input: RegisterInput) =>
    apiRequest<Account>('/auth/register', {
      method: 'POST',
      body: input,
    }),
};