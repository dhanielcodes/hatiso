# Endpoint structure

Every endpoint follows the same three layers (modelled on the dashboard page):

```
lib/api/<domain>.ts        →  lib/queries/use<Domain>.ts  →  page / component
typed request functions        React Query hooks              uses hooks only
```

## 1. `lib/api/<domain>.ts`: request functions

- Declare request/response types here.
- Each function returns the backend envelope `ApiResponse<T>` (`{ code, status, data }` from `@/types`)
  via `apiGet` / `apiPost` / `apiPut` / `apiPatch` / `apiDelete` from `./axios`.
- No unwrapping, `try/catch` or `status` checks. The axios interceptor rejects HTTP errors **and**
  `status: false` envelopes with `{ message, statusCode }` and shows the toast.
- Versioned routes use `` `/api/${process.env.NEXT_PUBLIC_API_VERSION}/...` ``.

```ts
export function getDashboard(params: DashboardParams = {}) {
  return apiGet<ApiResponse<DashboardData>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/dashboard`, params);
}
```

## 2. `lib/queries/use<Domain>.ts`: hooks

File name mirrors the API module (`auth.ts` → `useAuth.ts`, `orders.ts` → `useOrders.ts`).

- **Reads** → `useQuery` with `select: (response) => response.data`.
- **Writes** → `useMutation` whose `mutationFn` unwraps `.data`, and invalidates affected query keys
  in `onSuccess`.
- Export query keys as constants (`currentUserQueryKey`, …) so other hooks can invalidate them.

```ts
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(payload).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: currentUserQueryKey }),
  });
}
```

## 3. Pages and components

- Import hooks from `@/lib/queries/*`; import only **types** from `@/lib/api/*`.
- Read state from the hook (`data`, `isLoading`, `isError`, `isPending`) instead of local loading flags.
- Don't re-toast HTTP failures; the interceptor already did.

The auth store (`lib/store/authStore.ts`) only manages the session (`login`, `logout`, `user`).
Every other account action is a hook in `useAuth.ts`.
