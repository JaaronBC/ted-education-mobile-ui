
import { apiRequest } from '../../../services/apiClient';

export type SecurityEvent = {
  id: string;
  type: string;
  createdAt: string;
};

export type SecurityActivityResponse = {
  events: SecurityEvent[];
  hasMore: boolean;
  nextCursor?: string | null;
};

export const securityActivityApi = {
  list(token: string, cursor?: string) {
    const query = cursor
      ? '?cursor=' + encodeURIComponent(cursor)
      : '';

    return apiRequest<SecurityActivityResponse>(
      '/auth/security-activity' + query,
      { token },
    );
  },
};
