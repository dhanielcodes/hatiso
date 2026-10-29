'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Zap,
  Building2,
  UserCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  TextField,
  PasswordField,
  PhoneField,
  CheckboxField,
  SubmitButton,
} from '@/components/forms';
import { registerSchema, RegisterFormValues } from '@/lib/validation/schemas';

const initialValues: RegisterFormValues = {
  accountType: 'personal',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  agreeTerms: true,
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

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
        <div className="w-full max-w-lg rounded-3xl border border-slate-700/80 bg-gradient-to-b from-[#183745] to-[#122A34] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white sm:text-3xl">Create an Account</h1>
            <p className="mt-1.5 text-xs text-slate-300">
              Join thousands of users transacting and settling services across Africa.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={registerSchema}
            onSubmit={async (values) => {
              clearError();
              try {
                await register({
                  fullName: values.fullName,
                  email: values.email,
                  phone: values.phone,
                  accountType: values.accountType,
                  password: values.password,
                });
                router.push('/dashboard');
              } catch {
                // Handled in store
              }
            }}
          >
            {({ values, setFieldValue, handleChange }) => (
              <>
                <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-[#0F222A] p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFieldValue('accountType', 'personal')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                      values.accountType === 'personal'
                        ? 'bg-[#FF6500] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCircle2 className="h-4 w-4" />
                    <span>Personal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFieldValue('accountType', 'business')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                      values.accountType === 'business'
                        ? 'bg-[#FF6500] text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Business / Merchant</span>
                  </button>
                </div>

                <Form className="space-y-4" noValidate>
                  <TextField
                    name="fullName"
                    label={
                      values.accountType === 'business'
                        ? 'Business / Company Name'
                        : 'Full Legal Name'
                    }
                    variant="dark"
                    placeholder={
                      values.accountType === 'business' ? 'Acme Global Ventures' : 'John Doe'
                    }
                    icon={<User className="h-4 w-4" />}
                    onChange={(e) => {
                      handleChange(e);
                      if (error) clearError();
                    }}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField
                      name="email"
                      type="email"
                      label="Email Address"
                      variant="dark"
                      placeholder="name@example.com"
                      icon={<Mail className="h-4 w-4" />}
                      autoComplete="email"
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearError();
                      }}
                    />

                    <PhoneField
                      name="phone"
                      label="Phone Number"
                      variant="dark"
                      showCountryAffix={false}
                      placeholder="+234 801 234 5678"
                      icon={<Phone className="h-4 w-4" />}
                      onChange={(e) => {
                        handleChange(e);
                        if (error) clearError();
                      }}
                    />
                  </div>

                  <PasswordField
                    name="password"
                    label="Set Secure Password"
                    variant="dark"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    onChange={(e) => {
                      handleChange(e);
                      if (error) clearError();
                    }}
                  />

                  <CheckboxField
                    name="agreeTerms"
                    variant="dark"
                    label={
                      <>
                        I agree to the{' '}
                        <span className="text-[#FF6500] underline">Terms of Service</span> and{' '}
                        <span className="text-[#FF6500] underline">Privacy Policy</span>.
                      </>
                    }
                  />

                  <SubmitButton
                    disabled={isLoading}
                    className="mt-3 w-full rounded-xl bg-[#FF6500] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF6500]/30 transition-all hover:bg-[#E84D15] active:scale-95 disabled:opacity-50"
                    loadingLabel={
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating account...
                      </span>
                    }
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </SubmitButton>
                </Form>
              </>
            )}
          </Formik>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link href="/auth/login" className="font-semibold text-[#FF6500] hover:underline">
              Sign in here
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
