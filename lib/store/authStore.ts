import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from '@/types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async ({ emailOrPhone, password }) => {
        set({ isLoading: true, error: null });
        try {
          // Simulated authentication for boilerplate demo, ready for real API call via apiClient.post('/auth/login')
          await new Promise((resolve) => setTimeout(resolve, 800));

          const mockUser: User = {
            id: 'usr_882910',
            name: emailOrPhone.includes('@')
              ? emailOrPhone.split('@')[0].replace('.', ' ')
              : 'Demo User',
            email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@xnett.com`,
            phone: !emailOrPhone.includes('@') ? emailOrPhone : '+234 803 123 4567',
            accountType: 'personal',
            balance: 148500.5,
            currency: 'NGN',
            isVerified: true,
          };

          const mockToken = 'jwt_token_demo_' + Math.random().toString(36).substring(2);

          if (typeof window !== 'undefined') {
            localStorage.setItem('hasito_auth_token', mockToken);
          }

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err?.message || 'Login failed. Please verify your credentials.',
          });
          throw err;
        }
      },

      register: async ({ fullName, email, phone, accountType, password }) => {
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
        } catch (err: any) {
          set({
            isLoading: false,
            error: err?.message || 'Registration failed. Please try again.',
          });
          throw err;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hasito_auth_token');
          localStorage.removeItem('hasito_user');
        }
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
