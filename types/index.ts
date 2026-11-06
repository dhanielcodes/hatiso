export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'personal' | 'business' | 'bank';
  avatar?: string;
  balance?: number;
  currency?: string;
  isVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { emailOrPhone: string; password: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  href: string;
  popular?: boolean;
  badge?: string;
  serviceCount?: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  color?: string;
  plans?: Array<{ id: string; name: string; amount: number; validity?: string }>;
}

export interface BillPaymentPayload {
  categorySlug: string;
  providerId: string;
  customerIdentifier: string; // phone, meter number, smartcard no.
  amount: number;
  packageId?: string;
}

/** Envelope every backend endpoint responds with: `{ code, status, data }`. */
export interface ApiResponse<T = unknown> {
  code: number;
  status: boolean;
  data: T;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
