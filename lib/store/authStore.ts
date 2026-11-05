import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '@/types';
import { completeForgotPassword, forgotPassword, getCurrentUser, loginUser, ProfileUpdatePayload, registerUser, resetPassword, updateProfile } from '@/lib/api/auth';
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
        // ✅ Always start from clean state — wipe any stale persisted token first
        clearAuthSession();
        set({ isLoading: true, error: null, user: null, token: null, isAuthenticated: false });
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
          } catch { }

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

      register: async ({ fullName, email, phone, accountType, password }) => {
        set({ isLoading: true, error: null });
        try {
          const parts = fullName.trim().split(/\s+/);
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || parts[0] || '';

          let formattedPhone: string | null = null;
          const rawDigits = (phone || '').replace(/\D/g, '');
          if (rawDigits) {
            const nationalDigits = rawDigits.startsWith('234')
              ? rawDigits.slice(3)
              : rawDigits.startsWith('0')
                ? rawDigits.slice(1)
                : rawDigits;
            if (nationalDigits) {
              formattedPhone = `+234${nationalDigits}`;
            }
          }

          const result = await registerUser({
            type: accountType === 'business' ? 'BUSINESS' : 'INDIVIDUAL',
            email: email.trim().toLowerCase(),
            phone: formattedPhone,
            password: password || '',
            firstName,
            lastName,
          });

          set({ isLoading: false, error: null });
          return result;
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: getErrorMessage(err, 'Registration failed. Please try again.'),
          });
          throw err;
        }
      },
      updateProfile: async ({ firstName, lastName, displayName, bio }: ProfileUpdatePayload) => {
        set({ isLoading: true, error: null });
        try {
          const result = await updateProfile({
            bio,
            displayName,
            firstName,
            lastName,
          });

          set({ isLoading: false, error: null });
          return result;
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: getErrorMessage(err, 'Registration failed. Please try again.'),
          });
          throw err;
        }
      },
      resetPassword: async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
        set({ isLoading: true, error: null });
        try {
          const result = await resetPassword({
            oldPassword,
            newPassword,
          });

          set({ isLoading: false, error: null });
          return result;
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: getErrorMessage(err, 'Registration failed. Please try again.'),
          });
          throw err;
        }
      },
      forgotPassword: async ({ email }: { email: string }) => {
        set({ isLoading: true, error: null });
        try {
          const result = await forgotPassword({
            email,
          });

          set({ isLoading: false, error: null });
          return result;
        } catch (err: unknown) {
          set({
            isLoading: false,
            error: getErrorMessage(err, 'Registration failed. Please try again.'),
          });
          throw err;
        }
      },
      completeForgotPassword: async ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) => {
        set({ isLoading: true, error: null });
        try {
          const result = await completeForgotPassword({
            email,
            code,
            newPassword,
          });

          set({ isLoading: false, error: null });
          return result;
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
      name: 'hatiso-auth-storage',
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
