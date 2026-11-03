import type { LoginSession } from '@/lib/api/auth';

const accessTokenKey = 'hasito_auth_token';
const refreshTokenKey = 'hasito_refresh_token';
const userEmailKey = 'hasito_user_email';
const accessTokenCookie = 'hasito_auth_token';
// The key zustand/persist uses for the auth store
const zustandAuthKey = 'hasito-auth-storage';

function cookieAttributes(maxAge: number) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function persistAuthSession(session: LoginSession) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(accessTokenKey, session.accessToken);
  localStorage.setItem(refreshTokenKey, session.refreshToken);
  document.cookie = `${accessTokenCookie}=${encodeURIComponent(session.accessToken)}; ${cookieAttributes(session.expiresIn)}`;
}

export function persistUserEmail(email: string) {
  if (typeof window === 'undefined' || !email) return;
  localStorage.setItem(userEmailKey, email);
}

export function getStoredUserEmail() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(userEmailKey) ?? '';
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;

  // Raw session keys
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.removeItem(userEmailKey);
  localStorage.removeItem('hasito_user');
  sessionStorage.removeItem(accessTokenKey);

  // ✅ Also wipe the Zustand persist store so the old token is never rehydrated
  localStorage.removeItem(zustandAuthKey);

  // Expire the auth cookie
  document.cookie = `${accessTokenCookie}=; ${cookieAttributes(0)}`;
}

