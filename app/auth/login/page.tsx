"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form } from "formik";
import { useAuthStore } from "@/lib/store/authStore";
import { PasswordField, TextField, SubmitButton } from "@/components/forms";
import { loginSchema, LoginFormValues } from "@/lib/validation/schemas";
import { ArrowRight } from "lucide-react";
import AuthLayout, {
  AUTH_ERROR,
  AUTH_LINK,
  AUTH_PRIMARY,
  AUTH_SECONDARY,
  AuthHeading,
} from "@/components/auth/AuthLayout";
import {
  saveVerificationContext,
  verificationContextFromError,
  VERIFY_PATH,
} from "@/lib/auth/verification";

const initialValues: LoginFormValues = {
  emailOrPhone: "",
  password: "",
  rememberMe: true,
};

export default function LoginPage() {
  // Login board "Keep me signed in". The session is always kept for now; there is no short-session mode yet.
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  return (
    <AuthLayout
      aside={
        <>
          New to Hatiso?{" "}
          <Link href="/auth/register" className={AUTH_LINK}>
            Create an account
          </Link>
        </>
      }
    >
      <AuthHeading title="Welcome back.">
        Sign in to pay, bank and keep track of it all.
      </AuthHeading>

      <div className="flex flex-col gap-5">
        {error ? (
          <div role="alert" className={AUTH_ERROR}>
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
              router.push("/dashboard");
            } catch (err) {
              // Correct password, but the sign-up was never verified: finish it instead of showing an error.
              const pending = verificationContextFromError(
                err,
                values.emailOrPhone.trim(),
              );
              if (pending) {
                saveVerificationContext(pending);
                router.push(VERIFY_PATH);
              }
              // Any other error is set in the store and shown above the form.
            }
          }}
        >
          {({ handleChange }) => (
            <Form className="flex flex-col gap-5" noValidate>
              <TextField
                name="emailOrPhone"
                label="Email or phone number"
                required
                variant="auth"
                placeholder="Enter your email or phone number"
                autoComplete="username"
                onChange={(e) => {
                  handleChange(e);
                  if (error) clearError();
                }}
              />

              <PasswordField
                name="password"
                label="Password"
                required
                variant="auth"
                labelAction={
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-grey-800 hover:text-carbon"
                  >
                    Forgot password?
                  </Link>
                }
                placeholder="Enter your password"
                onChange={(e) => {
                  handleChange(e);
                  if (error) clearError();
                }}
              />

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-grey-800">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-[18px] w-[18px] accent-carbon"
                />
                Keep me signed in
              </label>

              <SubmitButton
                disabled={isLoading}
                className={AUTH_PRIMARY}
                loadingLabel={
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cloud border-t-transparent" />
                    Signing in…
                  </span>
                }
              >
                Sign in
              </SubmitButton>
            </Form>
          )}
        </Formik>
      </div>

      <div className="flex items-center gap-4 text-[13px] text-grey-600">
        <span className="h-px flex-1 bg-grey-150" />
        or
        <span className="h-px flex-1 bg-grey-150" />
      </div>
      <Link href="/#popular-categories" className={AUTH_SECONDARY}>
        Pay a bill as a guest
        <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
      </Link>
    </AuthLayout>
  );
}
