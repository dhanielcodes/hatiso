'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import { useAuthStore } from '@/lib/store/authStore';
import { PasswordField, TextField, SubmitButton } from '@/components/forms';
import { loginSchema, LoginFormValues } from '@/lib/validation/schemas';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import XnettLogo from '@/components/auth/XnettLogo';

const initialValues: LoginFormValues = {
  emailOrPhone: '',
  password: '',
  rememberMe: true,
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  return (
    <div className="grid min-h-screen bg-[#F7F4EF] lg:grid-cols-2">
      <AuthBrandPanel />

      <main className="flex min-h-screen flex-col bg-[#F7F4EF] px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="mb-8 lg:hidden">
          <XnettLogo />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div className="w-full max-w-[420px]">
            <div className="mb-7 text-center">
              <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111111] sm:text-[2rem]">
                Welcome back.
              </h1>
              <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-slate-500">
                Sign in to continue your Hatiso experience, built around the way you use services.
              </p>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600">
                {error}
              </div>
            ) : null}

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
                    label="Phone Number/ Email"
                    required
                    variant="auth"
                    placeholder="Enter your phone number or email"
                    autoComplete="username"
                    onChange={(e) => {
                      handleChange(e);
                      if (error) clearError();
                    }}
                  />

                  <div className="space-y-1.5">
                    <PasswordField
                      name="password"
                      label="Password"
                      required
                      variant="auth"
                      placeholder="••••••••••"
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearError();
                      }}
                    />
                    <div className="flex justify-end">
                      <Link
                        href="/auth/forgot-password"
                        className="text-[13px] font-medium text-[#E95312] transition-colors hover:text-[#E84D15]"
                      >
                        Forgot Password
                      </Link>
                    </div>
                  </div>

                  <SubmitButton
                    disabled={isLoading}
                    className="w-full rounded-xl bg-[#E95312] py-3.5 text-sm font-semibold text-white hover:bg-[#FF8A4C] active:scale-[0.99] disabled:opacity-50"
                    loadingLabel={
                      <span className="inline-flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Logging in...
                      </span>
                    }
                  >
                    Login
                  </SubmitButton>
                </Form>
              )}
            </Formik>

            <p className="mt-6 text-center text-[13px] text-slate-500">
              Don&apos;t have an account with Hatiso?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-[#E95312] transition-colors hover:text-[#E84D15]"
              >
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
