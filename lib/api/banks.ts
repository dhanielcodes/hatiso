import { apiGet } from '@/lib/api/axios';
import type { ApiResponse } from '@/types';

/** A partner bank from GET /banks (public). */
export interface Bank {
  id: string;
  name: string;
  bankIdentifier: string;
  logoUrl: string | null;
  primaryColor: string | null;
  /** e.g. "ACTIVE" */
  status: string;
  /** e.g. ["INTERNET_BANKING"] */
  channels: string[];
}

export function getBanks(page = 0, size = 100) {
  return apiGet<ApiResponse<Bank[]>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/banks`, { page, size });
}
