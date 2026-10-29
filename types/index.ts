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
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    accountType: 'personal' | 'business';
    password: string;
  }) => Promise<void>;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
