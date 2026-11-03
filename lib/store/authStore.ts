import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '@/types';
import { getCurrentUser, loginUser } from '@/lib/api/auth';
import { clearAuthSession, persistAuthSession, persistUserEmail } from '@/lib/auth/session';

function getErrorMessage(error: unknown, fallback: string) {
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
    ? error.message
    : fallback;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async ({ emailOrPhone, password }) => {
        set({ isLoading: true, error: null });
        try {
          const identifier = emailOrPhone.trim();
          const session = await loginUser({ identifier, password });
          persistAuthSession(session);
          if (identifier.includes('@')) persistUserEmail(identifier);

          const fallbackUser: User = {
            id: identifier,
            name: identifier.includes('@')
              ? identifier.split('@')[0].replace(/[._-]+/g, ' ')
              : identifier,
            email: identifier.includes('@') ? identifier : '',
            phone: identifier.includes('@') ? undefined : identifier,
            accountType: 'personal',
            isVerified: true,
          };

          let user = fallbackUser;
          try {
            const profile = await getCurrentUser();
            user = {
              ...fallbackUser,
              id: profile.userId,
              name: profile.displayName || `${profile.firstName} ${profile.lastName}`.trim() || fallbackUser.name,
              avatar: profile.avatarUrl ?? undefined,
            };
          } catch {}

          set({
            user,
            token: session.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: getErrorMessage(err, 'Login failed. Please verify your credentials.'),
          });
          throw err;
        }
      },

      register: async ({ fullName, email, phone, accountType }) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 900));

          const newUser: User = {
            id: 'usr_' + Date.now(),
            name: fullName,
            email,
            phone,
            accountType,
            balance: 5000.0,
            currency: 'NGN',
            isVerified: false,
          };

          const token = 'jwt_token_reg_' + Math.random().toString(36).substring(2);

          if (typeof window !== 'undefined') {
            localStorage.setItem('hasito_auth_token', token);
          }

          set({
            user: newUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: getErrorMessage(err, 'Registration failed. Please try again.'),
          });
          throw err;
        }
      },

      logout: () => {
        clearAuthSession();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'hasito-auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
      })),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
