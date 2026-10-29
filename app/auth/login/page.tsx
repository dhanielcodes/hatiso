'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import { ArrowLeft, Mail, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { PasswordField, TextField, CheckboxField, SubmitButton } from '@/components/forms';
import { loginSchema, LoginFormValues } from '@/lib/validation/schemas';

const initialValues: LoginFormValues = {
  emailOrPhone: '',
  password: '',
  rememberMe: true,
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#1B3C4A] text-white flex flex-col justify-between selection:bg-[#FF6500] selection:text-white">
      <header className="px-6 py-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#183541]">
            <Zap className="h-5 w-5 text-[#FF6500]" />
          </div>
          <span className="text-xl font-black tracking-widest text-white">
            X<span className="text-[#FF6500]">NETT</span>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-700/80 bg-gradient-to-b from-[#183745] to-[#122A34] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white sm:text-3xl">Welcome Back</h1>
            <p className="mt-1.5 text-xs text-slate-300">
              Sign in to manage your digital services, wallets and transactions.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={loginSchema}
            onSubmit={async (values) => {
              clearError();
              try {
                await login({
                  emailOrPhone: values.emailOrPhone,
                  password: values.password,
                });
                router.push('/dashboard');
              } catch {
                // Error is set in store
              }
            }}
          >
            {({ handleChange }) => (
              <Form className="space-y-4" noValidate>
                <TextField
                  name="emailOrPhone"
                  label="Email Address or Phone"
                  variant="dark"
                  placeholder="name@example.com or 080..."
                  icon={<Mail className="h-4 w-4" />}
                  autoComplete="username"
                  onChange={(e) => {
                    handleChange(e);
                    if (error) clearError();
                  }}
                />

                <PasswordField
                  name="password"
                  label="Password"
                  variant="dark"
                  placeholder="Enter your password"
                  labelAction={
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-medium text-[#FF6500] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  }
                  onChange={(e) => {
                    handleChange(e);
                    if (error) clearError();
                  }}
                />

                <CheckboxField
                  name="rememberMe"
                  variant="dark"
                  label="Remember me on this browser"
                />

                <SubmitButton
                  disabled={isLoading}
                  className="mt-2 w-full rounded-xl bg-[#FF6500] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF6500]/30 transition-all hover:bg-[#E84D15] active:scale-95 disabled:opacity-50"
                  loadingLabel={
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Authenticating...
                    </span>
                  }
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Authenticating...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </SubmitButton>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-[#FF6500] hover:underline">
              Create a new account
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} XNETT Marketplace. All rights reserved.
      </footer>
    </div>
  );
}
