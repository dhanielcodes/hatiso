# Hatiso (QApp)

Hatiso is a digital marketplace and personal finance dashboard. The public side lists services (airtime, data, electricity, cable TV, education, insurance…) and lets guests pay for them with Paystack. Signed-in users get a dashboard with spending analytics, transactions, banking, rewards, notifications, support and account settings.

This README is for frontend developers joining the project. It covers how to run the app, where things live, and the conventions for **endpoints**, **forms** and **buttons**. Please follow them so the codebase stays consistent.

---

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Folder structure](#folder-structure)
- [Routing and authentication](#routing-and-authentication)
- [Endpoint structure](#endpoint-structure)
- [Forms](#forms)
- [Buttons](#buttons)
- [Loading states](#loading-states)
- [State management](#state-management)
- [Errors and notifications](#errors-and-notifications)
- [Styling](#styling)
- [Landing pages](#landing-pages)
- [Conventions checklist](#conventions-checklist)

---

## Tech stack

| Concern | Library |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) with React 19 |
| Language | TypeScript (strict), path alias `@/*` → project root |
| Styling | Tailwind CSS v4 |
| Server state / data fetching | [TanStack Query v5](https://tanstack.com/query) on top of an [axios](https://axios-http.com) client |
| Client state | [Zustand](https://zustand.docs.pmnd.rs) (session, UI, marketplace) |
| Forms | [Formik](https://formik.org) + [Yup](https://github.com/jquense/yup) |
| Toasts | [sonner](https://sonner.emilkowal.ski) |
| Icons | [lucide-react](https://lucide.dev) |
| Charts | chart.js |
| Payments | Paystack (`react-paystack`) |

> **Next.js 16 note:** this version has breaking changes from older Next.js (for example, route protection lives in `proxy.ts`, not `middleware.ts`). Read the bundled docs in `node_modules/next/dist/docs/` before using an API you haven't used in this version.

---

## Getting started

### Requirements

- Node.js 20+
- npm (the repo uses `package-lock.json`)

### Setup

```bash
npm install
```

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL. All requests go through the axios client in `lib/api/axios.ts`. |
| `NEXT_PUBLIC_API_VERSION` | Version segment used in versioned routes, e.g. `v1` → `/api/v1/...`. |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key for checkout. Checkout shows an error without it. |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check the project (run before opening a PR) |

Only run one `next dev` per checkout. A second one in the same folder won't start.

---

## Folder structure

```text
.
├── app/                        # Routes (Next.js App Router). Pages stay thin.
│   ├── layout.tsx              # Root layout
│   ├── providers.tsx           # React Query client + <Toaster />
│   ├── page.tsx                # Marketplace home
│   ├── auth/                   # login, register, forgot-password, reset-password
│   ├── services/               # Public service catalogue + [slug] checkout
│   ├── categories/[slug]/      # Category listing
│   ├── banks/                  # Banks directory
│   ├── contact/, contact-us/   # Contact pages
│   └── dashboard/              # Signed-in area (protected by proxy.ts)
│       ├── layout.tsx          # Sidebar + header shell
│       ├── page.tsx            # Overview
│       ├── analytics/  banking/  notifications/  profile/
│       ├── rewards/  services/  support/  transactions/[id]/
│
├── components/
│   ├── forms/                  # ⭐ Shared Formik fields, buttons and styles (see "Forms")
│   ├── ui/Skeleton.tsx         # ⭐ Shared loading skeletons (see "Loading states")
│   ├── dashboard/              # Dashboard page bodies (ProfilePage, SupportPage, …) + sidebar, charts
│   ├── services/               # Service checkout pieces (payment form, selectors, Paystack)
│   ├── landing/LandingKit.tsx  # ⭐ Shared landing-page blocks (hero, features row, bento tiles…; see "Landing pages")
│   ├── marketplace/            # Public site sections (Navbar, Hero, Footer, …)
│   └── auth/                   # Auth UI pieces (brand panel, OTP input, step indicator, …)
│
├── lib/
│   ├── api/                    # ⭐ Request functions, one file per backend domain (see "Endpoint structure")
│   │   ├── axios.ts            # Axios instance, interceptors, apiGet/apiPost/apiPut/apiPatch/apiDelete
│   │   ├── auth.ts             # Login, current user, profile, password, registration
│   │   ├── dashboard.ts        # Dashboard + analytics
│   │   ├── digitalServices.ts  # Categories, catalogue, orders, payments
│   │   ├── notifications.ts    # Notifications + notification settings
│   │   └── orders.ts           # Order history
│   ├── queries/                # ⭐ React Query hooks, one file per lib/api module (useAuth.ts ↔ auth.ts, …)
│   ├── store/                  # Zustand stores (authStore, uiStore, marketplaceStore)
│   ├── auth/session.ts         # Token/cookie persistence helpers
│   ├── validation/             # Reusable Yup schemas (email, phone, password, amount, …)
│   ├── marketing/              # Landing data: banks list, service prefill hand-off
│   └── constants/              # Static data (categories)
│
├── types/index.ts              # Shared types: ApiResponse<T>, ApiError, User, AuthState, …
├── proxy.ts                    # Route protection (redirects for /dashboard and auth pages)
├── public/                     # Static assets
└── next.config.ts              # Next.js config (remote image hosts, Turbopack, …)
```

### Where does new code go?

| You're adding… | Put it in… |
| --- | --- |
| A new route | `app/<route>/page.tsx`, kept thin. It sets `metadata` and renders a component. |
| The UI for a dashboard page | `components/dashboard/<Name>Page.tsx` |
| A backend call | `lib/api/<domain>.ts` |
| A hook that uses it | `lib/queries/use<Domain>.ts` |
| A form input | Reuse `components/forms`. Only add a new field there if none fits. |
| A loading state | A skeleton from `components/ui/Skeleton.tsx`, never "Loading…" text |
| A reusable Yup rule | `lib/validation/schemas.ts` |
| A shared type | Next to its API function, or `types/index.ts` if it's app-wide |

Example of a thin route file:

```tsx
// app/dashboard/profile/page.tsx
import AccountPage from '@/components/dashboard/ProfilePage';

export const metadata = { title: 'Account | Hatiso' };

export default function DashboardAccountPage() {
  return <AccountPage />;
}
```

---

## Routing and authentication

- **Route protection** is handled in `proxy.ts`. It checks for the `hasito_auth_token` cookie:
  - `/dashboard/*` without a session → redirect to `/auth/login?redirect=<path>`
  - `/auth/login` or `/auth/register` with a session → redirect to `/dashboard`
- **Logging in** (`useAuthStore().login`) calls the login endpoint and saves the session through `lib/auth/session.ts`. The token goes to `localStorage` plus a cookie, so `proxy.ts` can see it. The store then loads the current user.
- **Every request** gets `Authorization: Bearer <token>` from the axios request interceptor.
- **On a `401`**, the response interceptor clears the session, resets the auth store and redirects to the login page.

---

## Endpoint structure

Every backend call goes through **three layers**. The dashboard page is the reference implementation.

```text
lib/api/<domain>.ts      →    lib/queries/use<Domain>.ts    →    page / component
typed request functions       React Query hooks                  uses hooks only
```

The full write-up with more examples is in [`lib/api/README.md`](lib/api/README.md).

### The response shape

Every endpoint responds with the same structure, typed as `ApiResponse<T>` in `types/index.ts`:

```ts
interface ApiResponse<T> {
  code: number;    // e.g. 200
  status: boolean; // false means the request failed
  data: T;         // the payload
}
```

### 1. Request functions (`lib/api/<domain>.ts`)

- Declare the request and response types in this file.
- Use the helpers from `lib/api/axios.ts` (`apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`). `apiPost` and `apiPut` take an optional axios config, for custom headers.
- **Return the full response as-is.** No unwrapping, `try/catch` or `status` checks here.
- Versioned routes use `` `/api/${process.env.NEXT_PUBLIC_API_VERSION}/...` ``. Public routes use `/api/public/...`.

```ts
// lib/api/auth.ts
import { apiGet, apiPut } from '@/lib/api/axios';
import type { ApiResponse } from '@/types';

export interface CurrentUserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export function getCurrentUser() {
  return apiGet<ApiResponse<CurrentUserProfile>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/users/me`);
}

export function updateProfile(payload: ProfileUpdatePayload) {
  return apiPut<ApiResponse<RegisterResponseData>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/users/me`, payload);
}
```

### 2. Hooks (`lib/queries/use<Domain>.ts`)

The hooks file is named after its API module: `auth.ts` → `useAuth.ts`, `orders.ts` → `useOrders.ts`.

- **Reads** use `useQuery` with `select: (response) => response.data`, so components get the payload directly.
- **Writes** use `useMutation`. The `mutationFn` returns `.data`, and `onSuccess` invalidates the queries the write affects.
- **Query keys** are exported as constants (`currentUserQueryKey`, `notificationSettingsQueryKey`, …) so other hooks can invalidate them.

```ts
// lib/queries/useAuth.ts
export const currentUserQueryKey = ['current-user'] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    select: (response) => response.data,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(payload).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: currentUserQueryKey }),
  });
}
```

### 3. Pages and components

- **Only call hooks.** Never import request functions from `lib/api` into a component; import **types** only.
- **Read loading and error state from the hook** (`isLoading`, `isError`, `isPending`) instead of keeping your own flags.

```tsx
const { data: user, isLoading, isError, refetch } = useCurrentUser();
const updateProfile = useUpdateProfile();

await updateProfile.mutateAsync({ firstName, lastName, displayName, bio });
```

### Available hooks

| File | Hooks |
| --- | --- |
| `useAuth.ts` | `useCurrentUser`, `useUpdateProfile`, `useResetPassword`, `useForgotPassword`, `useRecoverPassword`, `useRegister`, `useVerifyUser`, `useResendVerification` |
| `useDashboard.ts` | `useDashboard`, `useAnalytics`, `useAnalyticsCSV` |
| `useDigitalServices.ts` | `useDigitalServiceCategories`, `useDigitalServiceCatalogues`, `useCreateDigitalServiceOrder`, `useCreatePaymentQuote`, `useCreatePayment`, `useVerifyPayment` |
| `useNotifications.ts` | `useNotifications`, `useNotificationSettings`, `useUpdateNotificationSettings` |
| `useOrders.ts` | `useDigitalServiceOrders` |

The checkout hooks take `authenticated` (default `false`): pass `true` on the dashboard to use the signed-in endpoints, and leave it off for guest checkout.

### Adding a new endpoint

1. Add the types and a function to `lib/api/<domain>.ts`. Create the file if the domain is new.
2. Add a `useQuery` or `useMutation` hook to `lib/queries/use<Domain>.ts`, with an exported query key.
3. Use the hook in your component.

---

## Forms

**Every form uses Formik, a Yup schema, and the shared components in `components/forms`.** Don't build forms from `useState` and raw `<input>`s.

### Available components

Import them from `@/components/forms`:

| Component | Use for |
| --- | --- |
| `TextField` | Text, email, etc. Supports `icon` (trailing) and `startIcon` (leading). |
| `PasswordField` | Password with a show/hide toggle |
| `PhoneField` | Phone numbers. `dialCode="+234"` shows a fixed prefix; `showCountryAffix` shows the NG flag. |
| `TextAreaField` | Multi-line text |
| `SelectField` | Native select. Takes `options: { value, label }[]` and `placeholder`. |
| `DateField` | Date picker (`minDate`, `maxDate`) |
| `NumberField` | Numbers (stored as a `number` by default) |
| `AmountField` | Naira amounts, formatted while typing |
| `MinorAmountField` | Naira entered by the user, stored in kobo |
| `CheckboxField` | Checkbox with a label |
| `SubmitButton` | Submit button that shows a spinner while Formik is submitting |
| `Button` | Non-submit actions (Cancel, Edit, Back…) |
| `FieldShell` | Label + error + hint wrapper, for building a new field |
| `useFormField` | Hook for building custom Formik-bound controls (see below) |

All fields take `name`, `label`, `required`, `hint`, and a `variant`:

| `variant` | Where |
| --- | --- |
| `light` (default) | Public marketplace pages |
| `auth` | Login, register and recovery screens |
| `dashboard` | Signed-in dashboard pages |
| `dark` | Dark panels |

### Example

```tsx
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { PasswordField, SubmitButton, TextField } from '@/components/forms';
import { emailSchema } from '@/lib/validation';

type Values = { email: string; password: string };

const schema = Yup.object({
  email: emailSchema,
  password: Yup.string().required('Enter your password.'),
});

export function ExampleForm() {
  const mutation = useSomething(); // a hook from lib/queries

  const handleSubmit = async (values: Values, { resetForm }: FormikHelpers<Values>) => {
    await mutation.mutateAsync(values); // return/await the promise so the button shows its spinner
    resetForm();
  };

  return (
    <Formik<Values> initialValues={{ email: '', password: '' }} validationSchema={schema} onSubmit={handleSubmit}>
      <Form noValidate className="space-y-5">
        <TextField name="email" type="email" label="Email" required variant="dashboard" />
        <PasswordField name="password" label="Password" required variant="dashboard" />
        <SubmitButton variant="primary" loadingLabel="Saving…">Save</SubmitButton>
      </Form>
    </Formik>
  );
}
```

### How validation behaves

The shared fields handle this through `useFormField`. You don't need to configure anything:

- **Errors appear while typing.** A field counts as touched on its first change, not only on blur.
- **Errors show after a submit attempt**, even on fields the user never touched.
- **Errors match the current value.** Values are always validated against the new value.

Don't set `validateOnChange={false}` on a `<Formik>`: it brings back errors that lag behind what the user typed.

### Building a custom field

Use `useFormField` instead of Formik's `useField`. The support page's star rating is an example:

```tsx
import { useFormField } from '@/components/forms';

function RatingField({ name }: { name: string }) {
  const { field, setValue, error } = useFormField<number>(name);
  return (
    <>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" aria-checked={field.value === n} onClick={() => setValue(n)}>
          ★
        </button>
      ))}
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </>
  );
}
```

`useFormField` returns:

- `field`: spread it on an input. Its `onChange` also marks the field touched.
- `setValue(v)`: validates the new value and marks the field touched.
- `markTouched()`: marks the field touched without validating.
- `hasError`, `error`, `meta`, `helpers`.

Don't call `helpers.setValue(x)` followed by `helpers.setTouched(true)`. In Formik that validates the previous value.

### Reusable rules

`lib/validation/schemas.ts` exports `emailSchema`, `phoneSchema`, `passwordSchema`, `requiredString()`, `amountSchema()`, `numberSchema()`, `dateSchema()` and full schemas such as `loginSchema` and `registerSchema`. Reuse them before writing new rules.

### OTP codes

Use `components/auth/OtpInput` (`value`, `onChange`, `length`, `hasError`) for verification codes. It is used in register, forgot-password and Banking.

- It handles fast typing, backspace across boxes, arrow keys and pasting a whole code.
- It tracks the latest value itself, so digits aren't lost when keys arrive faster than React re-renders.
- Clearing `value` from outside (for example after a rejected code) moves the cursor back to the first box.
- The boxes shrink below the `sm` breakpoint so six of them fit on a 375px screen.

### Not every input is a form

Search boxes and list filters (on Transactions, Notifications, Analytics, Banks…) don't submit anything. They stay as plain controlled inputs.

---

## Buttons

| Component | When |
| --- | --- |
| `SubmitButton` | The submit button inside a `<Formik>` form. It disables itself and shows a spinner while submitting. |
| `Button` | Any other action button. It defaults to `type="button"`. |

Both take `variant`, `size` and `fullWidth`, built from `buttonClass()` in `components/forms/styles.ts`:

| Prop | Values |
| --- | --- |
| `variant` | `primary` (orange), `secondary` (outlined), `ghost` (text) |
| `size` | `sm`, `md` (default), `lg` |
| `fullWidth` | `true` to stretch |

```tsx
<div className="flex justify-end gap-2">
  <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
  <SubmitButton variant="primary" size="sm" loadingLabel="Saving…">Save</SubmitButton>
</div>
```

How `SubmitButton` uses `loadingLabel`:

- **Plain text:** shows the built-in spinner next to the text.
- **A JSX element:** shows the element as given.

If you leave `variant` off, `SubmitButton` adds no styles of its own, so you can style it fully with `className`. The auth pages do this.

For a new style that will be reused, add a variant to `buttonClass()` instead of copying long class strings.

---

## Loading states

**Every loading state is a skeleton.** Don't show "Loading…" text in cards, lists, charts or pages. Skeletons keep each card's shape, so the layout doesn't jump when data arrives. Everything lives in `components/ui/Skeleton.tsx`:

| Component | Use for |
| --- | --- |
| `Skeleton` | Base block. Size it with `className`. `strong` gives a darker shade for headline values; `tone="dark"` is for dark backgrounds. |
| `SkeletonGroup` | Wraps your own skeleton layout. Adds `role="status"` and a screen-reader label (`label="Loading …"`). |
| `MetricCardSkeleton` | Stat cards (label, big value, change line) |
| `ChartSkeleton` | Charts: `shape="bars"` (bar/line/area), `"donut"` (pass a square container) or `"heatmap"` |
| `ListSkeleton` | List rows (`rows`, `avatar`, `trailing`); `card` makes each row its own bordered card |
| `ProgressListSkeleton` | Label + value + progress bar rows (e.g. top providers) |
| `TableRowsSkeleton` | Table body rows. Render it inside `<tbody>` with `columns`. |
| `TextSkeleton` | A few lines of text |
| `FormSkeleton` | Label + input pairs, optional button |

```tsx
const { data, isLoading } = useDashboard(params);

{isLoading ? <ChartSkeleton shape="bars" label="Loading spending" /> : <SpendingChart data={data.spendingOverview} />}

{isLoading
  ? Array.from({ length: 4 }, (_, i) => <MetricCardSkeleton key={i} />)
  : metrics.map((m) => <MetricCard key={m.label} {...m} />)}
```

Rules:

- **Match the content.** Render the skeleton in the same container and size as the real content, inside the card's own header if it has one.
- **Custom layouts:** build them from `Skeleton` blocks inside one `SkeletonGroup`. See the Profile details skeleton for an example.
- **Don't nest groups.** One `SkeletonGroup` per loading region, so screen readers announce "Loading" once.
- **Button spinners are separate.** "Saving…" inside a button comes from `SubmitButton`'s `loadingLabel`, not from a skeleton.
- **Empty and error states are still text.** Skeletons are only for "still loading".

---

## State management

| Kind of state | Where it lives |
| --- | --- |
| Data from the backend | React Query, through hooks in `lib/queries` |
| Session (token, logged-in user, `login`, `logout`) | `lib/store/authStore.ts` (Zustand, persisted to `localStorage`) |
| UI state (mobile menu, language) | `lib/store/uiStore.ts` |
| Marketplace search / selected category | `lib/store/marketplaceStore.ts` |
| Form state | Formik |

Don't put API calls in Zustand stores. The auth store keeps `login` because it also persists the session, but every other account action is a hook in `useAuth.ts`.

The React Query defaults in `app/providers.tsx` are: retry once, no refetch on window focus.

---

## Errors and notifications

- **All failed requests reject with the same `ApiError` shape** (`{ message, statusCode, errors? }`, in `types/index.ts`). The axios response interceptor does this for:
  - HTTP errors
  - responses with `status: false`, even when the HTTP status is 2xx
- **The interceptor shows the error toast for you** (sonner, top-right), except on `401`, where it logs the user out instead.
  - Don't toast HTTP failures again in components.
  - Only toast errors your own code throws, such as `new Error(...)`. `ProfilePage` has a `notifyError` helper that does exactly this.
- **Success toasts are up to the component**: `toast.success('Profile updated.')`.

---

## Styling

- **Tailwind CSS v4**, configured through `app/globals.css`, with utility classes in JSX.
- **Brand colours used throughout:**
  - Orange `#E95312` / `#EE7230` / `#FF6500`
  - Navy `#243B4A` / `#20232A`
  - Muted text `#52617A` / `#7A7F8A`
  - Borders `#E6E3E0`
- **Form and button styles live in `components/forms/styles.ts`** (`fieldControlClass`, `fieldLabelClass`, `buttonClass`, …). Use these rather than copying class strings.
- **Charts** are Chart.js wrappers in `components/dashboard/DashboardCharts.tsx`:
  - `SpendingChart`: line/area chart.
  - `ServiceUsageChart`: a pie by default; pass `donut` for the ring with rounded segments used on Analytics.
- **Auth layout** (`components/auth/AuthShell.tsx`) wraps login, register and forgot-password in the landing look:
  - The ink brand panel sits on the left on desktop.
  - On the right, the form sits in a white card on light grey, with a "Back to home" pill and the logo (dark wordmark) on mobile.
  - Buttons are orange pills, and the `auth` field variant in `components/forms/styles.ts` uses the landing greys with an orange focus.
  - New auth screens should use `<AuthShell>` rather than building their own layout.
- **Auth brand panel** (`components/auth/AuthBrandPanel.tsx`) is the left side of the auth layout on desktop:
  - It stays in the viewport while the form scrolls, and the photo frame shrinks to fit shorter screens.
  - Photos live in the `SLIDES` array (`src`, `alt`, plus `position` and `zoom` to set the crop). They cross-fade inside a squircle frame every 6s.
  - Picking a slide with the dots or a swipe restarts the countdown, and it pauses while the tab is in the background.
  - The floating icon bubbles use the `auth-float*` animations in `globals.css`, which turn off when reduced motion is preferred.
- **Guest sign-up invite** (`components/marketplace/CustomerInvitePopup.tsx`):
  - When a guest closes the payment receipt on a service page ("Make another payment" or "Return to marketplace"), `ServiceDetailPage` shows the "Ready to make it official?" popup before continuing.
  - Its buttons link to `/auth/login` and `/auth/register`. Closing it (✕, Escape or the backdrop) carries on where the guest was going.
  - `shouldInviteGuest(isAuthenticated)` skips logged-in users, and guests who already saw it this browser session (`sessionStorage` key `hasito_invite_shown`).
- **Icons** come from `lucide-react`.
- **Landing pages** follow the "Hatiso Web Redesign" file. See "Landing pages" below.
- **Dashboard shell** (`app/dashboard/layout.tsx` + `components/dashboard/DashboardSidebar.tsx`) uses the landing palette:
  - Ink sidebar (`#0A1014`) with pill nav items; the active item gets `#1A2329` and an orange icon.
  - White header with pill buttons, including "Visit Hatiso".
  - Page background `#F3F4F5`, with `#E3E8EB` dividers.
  - The dashboard keeps the Be Vietnam Pro font.
- **Dashboard pages** use the same palette. When adding a page, stick to these tokens rather than the old beige/navy ones:
  - Text: `#10202A` (headings), `#4A5B64` (body), `#5D6F78` (muted).
  - Orange: `#EE6E2D` for fills, `#C2531C` for orange text and links, `#F48245` on hover.
  - Borders: `#E3E8EB` (cards, dividers), `#DDE3E6` (inputs, outline buttons).
  - Dark banners and selected tabs: `#10202A`, with `rounded-[28px]` on banners; white cards are `rounded-3xl`.
  - Shared `Button`/`SubmitButton` (`components/forms/styles.ts`) are pills: orange primary with dark text, outline secondary.
- **Remote images** must come from a host listed under `images.remotePatterns` in `next.config.ts`.

---

## Landing pages

The public pages (home `/`, services `/services/[slug]` and `/categories/[slug]`, `/banks`, `/contact`) share one look.

**Look and building blocks**
- **Font:** Plus Jakarta Sans, loaded in `app/layout.tsx` as `--font-plus-jakarta` and used through the `font-jakarta` class. The dashboard keeps Be Vietnam Pro.
- **Colours:**
  - Ink `#0A1014`: hero, footer and CTA
  - Navy `#10202A`: dark tiles
  - Slate `#233C49`
  - Orange `#EE6E2D` / `#E2591A`
  - Light greys `#F3F4F5` / `#EEF1F3`
- **`components/landing/LandingKit.tsx`** holds the shared pieces:
  - `LandingPage`, `DarkHero`
  - `HeroHeadline`, `HeroLead`, `HeroPillInput`, `ProviderRow`
  - `FeatureRow`, `BentoTiles` (big dark tile with `FannedCards`, an `Orbit` tile and two stat tiles), `SectionPill`, `OrangePill`
  - `LpIcon`: the design's own outline icons
- **Animations:** the `lp-*` classes in `app/globals.css` (rise, card bob, ping, orbit, marquee, scroll reveal). They all turn off when reduced motion is preferred.
- **Shared on every page:**
  - `Navbar`: links Personal, Business (`/#business`), Banks and Contact us. Signed-in users get a profile menu instead of the Sign in / Create account pills.
  - `CtaBanner`: "Ready to get started?". Signed-in users see "Go to your dashboard".
  - `Footer`

**Home**
- `components/marketplace/HomeLanding.tsx` puts the sections together.
- The "Pay a bill" card's state (`usePayBill` in `HeroSection.tsx`) lives there, so the "Pay here" category cards can open the right tab.
- The hero phone input and the card's phone field share one value.
- Hero layout: a centred headline and quick top-up input, then three cards. The orange middle card holds the "Pay a bill" form. The left card shows a live summary of what the form will pay (amount, provider, number). The right card is a decorative spending chart. On screens narrower than 1280px the form card comes first and the other two sit below it.
- Paying on the card does not charge anything. It opens `/services/<slug>` with the network, number and amount already filled in, and the guest pays there as usual.

**Service pages**
- `ServiceDetailPage` renders the hero, features and bento from `components/services/serviceLanding.ts` (copy per slug, with a fallback for unknown slugs).
- The service card is capped at 720px (or the screen height, if smaller). Its fields scroll inside it, while the header and service tabs stay at the top. The "You pay / Continue" row and the payment review's Reset / Continue buttons are `sticky` at the bottom, so they never scroll out of view.
- The white service card holds:
  - Service pills built from the API categories
  - `ServicePaymentForm` with `variant="landing"`, which adds amount chips and the "You pay" footer
    - Products with a set price (`fixedAmountMinor`, or a read-only amount field, e.g. data bundles) show no amount input or chips. Their price shows in "You pay".
  - Paystack, the receipt and the guest invite, which work as before
- The hero input ("Continue") carries the number into the form.

**Prefill hand-off**
- `lib/marketing/servicePrefill.ts` moves details from a landing widget to the checkout.
- `saveServicePrefill` writes them, `takeServicePrefill(slug)` reads them once, and `matchBiller` picks the biller.
- The details sit in `sessionStorage` (`hatiso_service_prefill`), so phone and meter numbers never go in the URL.

**404 page**
- `app/not-found.tsx` is the "Page not found" page, in the landing look (navbar, dark hero, footer). It shows for any URL with no matching route and when a page calls `notFound()`, and returns a 404 status.
- It offers "Back to home" and "Contact us", plus quick links to airtime, data, electricity and banks (`SUGGESTIONS` in the file).

**Popular categories and service pages**
- Home page cards come from `GET /digital-services/categories` (`useDigitalServiceCategories`).
- `lib/marketing/serviceCategories.ts` turns each API category into one or more services (slug, label, icon, and the home payment card tab when there is one):
  - `TELCO` gives two services: **Airtime** (`/services/airtime`) and **Data** (`/services/data`). Both fetch the TELCO catalogue; `billersForService` keeps the products named "VTU" or "Airtime" for airtime and everything else for data, and drops billers left empty.
  - Airtime is in `SINGLE_PRODUCT_SERVICES`, so its form hides "Select product" and uses the network's airtime product.
  - `INTERNET_SERVICES` (Smile, Spectranet) is its own service, **Internet services** (`/services/internet-services`).
  - `DISCO`, `CABLE`, `EDUCATION`, `INSURANCE` and `OTHER_SERVICES` map to one service each.
- Airtime, Data, Electricity and TV open the home payment card; the rest link to `/categories/<slug>`.
- The service page tabs and the slug → category lookup use the same map, so add new services there. Categories it doesn't know yet still show, labelled from the API name.
- The dashboard Digital Services page (`/dashboard/services`) uses the same split: Airtime and Data are separate cards with only their own products, and Airtime hides "Select product". Each card's name, description, icon, colour and badge come from `serviceConfig` in `components/dashboard/DigitalServicesPage.tsx`, keyed by service slug; a service missing there gets no card.

**Banks**
- `lib/marketing/banks.ts` (`BANKS_DATA`) is the single list for the home banks block and `/banks`.
- The status counts, "Show N banks", the filters (service supported, status) and the stat tiles are all worked out from it.
- To add a bank, add an entry there. `mono` overrides the avatar initials.

**Contact**
- The hero email ("Get in touch") pre-fills the contact form and jumps to it.
- The form still uses the shared Formik fields and `contactSchema`.

---

## Conventions checklist

Before opening a PR:

- [ ] Backend calls live in `lib/api/<domain>.ts`, return `ApiResponse<T>`, and are only used through hooks in `lib/queries/use<Domain>.ts`
- [ ] Components import only **types** from `lib/api`
- [ ] Mutations invalidate the queries they change
- [ ] Forms use Formik, a Yup schema and `components/forms` fields; custom controls use `useFormField`
- [ ] Submit buttons are `SubmitButton`; other buttons are `Button`
- [ ] Loading states use the skeletons in `components/ui/Skeleton.tsx`, never "Loading…" text
- [ ] No duplicate error toasts for HTTP failures
- [ ] **This README is updated in the same change** for any new feature, route, endpoint, hook, form component, button variant, env var or convention (and `lib/api/README.md` for endpoint-layer changes)
- [ ] `npx tsc --noEmit` and `npm run lint` show no new problems
