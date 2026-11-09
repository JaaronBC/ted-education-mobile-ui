import { apiRequest } from './apiClient';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}