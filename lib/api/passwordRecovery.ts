// Public (unauthenticated) password recovery endpoints.
// Uses fetch so it has no dependency on your authenticated API client. If you have an axios
// instance for public routes, swap `post` for it and keep the two exported functions as-is.

import { apiPost } from "./axios";


export class ApiError extends Error {
    status: number;
    data: unknown;
    constructor(message: string, status: number, data: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/** Sends a reset code to the account email. */
export const forgotPassword = (email: string) =>
    apiPost('/api/public/auth/password/forgot', { email });

/** Verifies the code and sets the new password in one call. */
export const recoverPassword = (payload: { email: string; code: string; newPassword: string }) =>
    apiPost('/api/public/auth/password/recover', payload);