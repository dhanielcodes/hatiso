# Hatiso (QApp)

Hatiso is a digital marketplace and personal finance dashboard. The public side lists services (airtime, data, electricity, cable TV, education, insurance…) and lets guests pay for them with Paystack. Signed-in users get a dashboard with spending analytics, transactions, banking, rewards, notifications, support and account settings.

This README is for frontend developers joining the project. It covers how to run the app, where things live, and the conventions for **endpoints**, **forms** and **buttons**. Please follow them so the codebase stays consistent.

---

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Folder structure](#folder-structure)
- [Routing and authentication](#routing-and-authentication)
- [Unfinished sign-ups (verification resume)](#unfinished-sign-ups-verification-resume)
- [Dashboard overview](#dashboard-overview)
- [Digital services](#digital-services)
- [Banks](#banks)
- [Support](#support)
- [Contact form](#contact-form)
- [Home page configuration](#home-page-configuration)
- [Endpoint structure](#endpoint-structure)
- [Forms](#forms)
- [Buttons](#buttons)
- [Loading states](#loading-states)
- [State management](#state-management)
- [Errors and notifications](#errors-and-notifications)
- [Styling](#styling)
- [Conventions checklist](#conventions-checklist)

---

## Tech stack

| Concern | Library |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (pinned to 16.4.6; App Router, Turbopack) with React 19 |
| Language | TypeScript (strict), path alias `@/*` → project root |
| Styling | Tailwind CSS v4 |
| Server state / data fetching | [TanStack Query v5](https://tanstack.com/query) on top of an [axios](https://axios-http.com) client |
| Client state | [Zustand](https://zustand.docs.pmnd.rs) (session, UI, marketplace) |
| Forms | [Formik](https://formik.org) + [Yup](https://github.com/jquense/yup) |
| Toasts | [sonner](https://sonner.emilkowal.ski) |
| Icons | [lucide-react](https://lucide.dev) |
| Charts | chart.js |
| Payments | Paystack (`react-paystack`) |

> **Version:** Next.js and `eslint-config-next` are pinned to exactly 16.4.6. That upgrade from 16.4.3 was a security fix for a published advisory. `next.config.ts` sets `experimental.agentUpgrade: "security"`, alongside `agentFeedback`, so agent-run upgrades stay on security releases. Route types (`PageProps`, `LayoutProps`) are generated into `.next/types`; in a fresh checkout run `npx next typegen` (or start `next dev`) before `tsc --noEmit`.

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
│   ├── auth/                   # login, register, verify, forgot-password, reset-password
│   ├── services/               # Public service catalogue + [slug] checkout
│   ├── categories/[slug]/      # Category listing
│   ├── banks/                  # Banks directory
│   ├── contact/, contact-us/   # Contact pages
│   └── dashboard/              # Signed-in area (protected by proxy.ts)
│       ├── layout.tsx          # Sidebar + header shell
│       ├── page.tsx            # Overview
│       ├── analytics/  banking/  notifications/  profile/
│       ├── rewards/  services/  support/  support/tickets/[ticketId]/  transactions/[id]/
│
├── components/
│   ├── forms/                  # ⭐ Shared Formik fields, buttons and styles (see "Forms")
│   ├── ui/Skeleton.tsx         # ⭐ Shared loading skeletons (see "Loading states")
│   ├── dashboard/              # Dashboard page bodies (ProfilePage, SupportPage, …) + sidebar, charts, PromoCarousel
│   ├── services/               # Service checkout pieces (payment form, selectors, Paystack)
│   ├── support/                # Support enquiry form, transaction support modal, display helpers
│   ├── marketplace/            # Public site sections (Navbar, Hero, Footer, …)
│   ├── brand/HatisoLogo.tsx    # The Hatiso wordmark (use this for every logo)
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
│   ├── theme/theme.ts          # Colour themes and light/dark mode: THEMES, MODES, useTheme, useColorMode, setTheme, setMode (see "Styling")
│   ├── queries/                # ⭐ React Query hooks, one file per lib/api module (useAuth.ts ↔ auth.ts, …)
│   ├── store/                  # Zustand stores (authStore, uiStore, marketplaceStore)
│   ├── auth/session.ts         # Token/cookie persistence helpers
│   ├── auth/verification.ts    # Unfinished sign-up context (verify/resume flow)
│   ├── validation/             # Reusable Yup schemas (email, phone, password, amount, …)
│   └── constants/              # Static data (categories)
│
├── types/index.ts              # Shared types: ApiResponse<T>, ApiError, User, AuthState, …
├── proxy.ts                    # Route protection (redirects for /dashboard and auth pages)
├── public/                     # Static assets
│   └── brand/                  # Hatiso wordmark SVGs (carbon, graphite, cloud, white, black) + app icons
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
- **Unknown URLs** show `app/not-found.tsx`: a "Page not found" page in the marketplace look (navbar, dark teal background, footer), returned with a 404 status. It also shows when a page calls `notFound()`. It has "Back to home", "Contact us" and quick links to airtime, data, electricity and banks (`SUGGESTIONS` in the file).

---

## Unfinished sign-ups (verification resume)

Someone who started signing up but never verified their email or phone is sent back to the code screen. They are never asked to create a second account.

- **`/auth/verify`** (`app/auth/verify/page.tsx`) is the Verify Contact screen. It reads the pending sign-up from `sessionStorage` (`hatiso_verification_context`: `userId`, `purpose`, `contact`, `codeSentAt`). It never stores a password or a code. Helpers are in `lib/auth/verification.ts`.
  - It uses the same layout as sign-up (step indicator on step 3), and the same "Account Verification" screen. With a saved sign-up, it shows `components/auth/VerifyContactPanel.tsx`: a six-digit code for `VERIFY_EMAIL` or `VERIFY_PHONE`, and "Click to resend code" after a 60-second wait. The wait survives a reload (it counts from `codeSentAt`).
  - Without one, it asks for the email or phone and calls `POST /api/public/users/user/resume-verification`. It only moves on when the response has `verificationRequired: true`. Otherwise it shows the same neutral message, so it never reveals whether an account exists.
  - After a correct code the account is active: the context is cleared and the user goes to `/auth/login`.
- **Login.** A correct password on an unverified account returns `409` with `data.error === 'verification_required'`, plus `userId` and `purpose`. The login page saves those and opens `/auth/verify`. This is not shown as a wrong-password error, and it gets no toast. Every other login error shows as before. The login page has no link to `/auth/verify`; users land there from login or sign-up.
- **Sign-up, fresh.** Step 3 of `/auth/register` uses the same `VerifyContactPanel`, and the sign-up is also saved to `sessionStorage`, so `/auth/verify` can pick it up after a reload. After the code, the page signs in with the password from step 2 and shows the welcome modal. If that sign-in fails, it goes to `/auth/login` instead.
- **Sign-up, repeated.** If registering fails because the email or phone is taken (HTTP `409`, or a message like "already exists"), the page calls resume-verification. If `verificationRequired` is true, it continues to step 3 for that sign-up. If not, it shows the registration error.
- **Errors.** `ApiError` now carries `code` (the backend's `data.error`) and `data` (the raw `data` object). The axios interceptor never toasts `verification_required`, and it skips the toast for any request sent with `{ skipErrorToast: true }`. Register and resume-verification use that option because the page shows those errors itself.

---

## Dashboard overview

`app/dashboard/page.tsx` follows the dashboard design:
- **Header:** the date as "Wednesday, 25th November 2026", then "Welcome Back, <first name>". The top bar shows a grey avatar with a person icon when the user has no photo.
- **Hero:** the photo sits in a blob frame with floating service icons. The design's photo (a couple) isn't in the repo yet; set `HERO_IMAGE` at the top of the page when it arrives.
- **Offers carousel** (`components/dashboard/PromoCarousel.tsx`): three slides (5× points on data, ₦500 cash back, refer & earn) in orange, green and blue.
  - It cross-fades every 6s and pauses on hover or focus. It doesn't auto-rotate for users who prefer reduced motion.
  - The dots pick a slide. Slide copy, links and colours live in its `SLIDES` array.
- **Metrics:** labels and comparisons follow the selected period, e.g. "Spent this week" with "+ 12.4% from Last week". Transactions show the count difference ("+ 3 more"), and success rate shows "↑ 2.1%" (percentage points).
- **Spending overview:**
  - A green or red change pill shows "vs Last 7 days".
  - `SpendingChart` runs with `variant="overview"`: lower-case compact axis ("4m"), vertical gridlines only, and a card tooltip with the full date and amount.
  - Analytics still uses the default variant.
- **Digital Services usage:** a pie with callout labels (`ServiceUsageChart` with `callouts`). Names and colours per service are in `SERVICE_META`.
- **Recent Transaction:** the last 5. Each row shows:
  - A provider logo: network images for MTN, Airtel, Glo and 9mobile, and a brand-colour badge for DStv, GOtv, SportyBet and others (`PROVIDERS`).
  - The recipient (falls back to the product name), with "Service - Provider" underneath.
  - A SUCCESS, PENDING or FAILED pill.
- **Reward points:** that card is commented out in the page and stays that way until rewards are ready.

## Digital services

`GET /digital-services/categories` returns API categories, not services. `lib/digitalServices/categoryServices.ts` turns each one into the services people see:

- `TELCO` gives two services: **Airtime** (`/categories/airtime`) and **Data** (`/categories/data`). Both fetch the TELCO catalogue, then `billersForService` keeps the products named "VTU" or "Airtime" for airtime and everything else for data. Billers left with no products are dropped.
- Airtime is in `SINGLE_PRODUCT_SERVICES`, so `ServicePaymentForm` gets `hideProductSelector` and uses the network's airtime product without showing "Select product".
- `INTERNET_SERVICES` (Smile, Spectranet) is its own service, **Internet Services** (`/categories/internet-services`).
- `DISCO`, `CABLE`, `EDUCATION`, `INSURANCE` and `OTHER_SERVICES` give one service each.
- The home "Popular Categories" cards, the service tabs, the dashboard Digital Services cards (`/dashboard/services`), the slug → category lookup (`CATEGORY_BY_SLUG`) and the form heading (`SERVICE_LABEL_BY_SLUG`) all read from this file, so add new services there.
- On the dashboard, the card's description, icon, colour and badge come from `serviceConfig` in `components/dashboard/DigitalServicesPage.tsx`, keyed by service slug. A service missing there doesn't get a card.

## Banks

The banks page (`/banks`), the home "Banks" section and the dashboard banking page (`/dashboard/banking`) all list banks from `GET /banks` through `useBanks` (`lib/queries/useBanks.ts`). Each shows a loading skeleton and a "Try again" message if the request fails. Shared helpers are in `lib/banks/bankDisplay.ts`:

- **Logo:** `components/banks/BankLogo.tsx` shows `logoUrl`. With no logo, it shows the bank's initials on its `primaryColor` (or dark teal).
- **Status:** `ACTIVE` reads as "Online". `MAINTENANCE` or `DEGRADED` is amber, and any other status is red and shown as the API sends it. The status filters on `/banks` and the dashboard tabs are built from the statuses the API returns.
- **Channels:** `channels` (e.g. `INTERNET_BANKING`) are shown as "Internet banking", and the `/banks` "Channels" filter is built from them.
- **Website:** the API doesn't return a website URL yet. "Continue to bank" uses `BANK_WEBSITES` (keyed by `bankIdentifier`), or `DEFAULT_BANK_URL` when a bank isn't listed there. Replace this once the API sends a URL.
- The home section shows the admin's featured banks from the page configuration, or the first 10 banks (`HOME_BANK_LIMIT`) when none are picked. See [Home page configuration](#home-page-configuration).

## Support

The dashboard support module uses the individual support API (`lib/api/support.ts`, hooks in `lib/queries/useSupport.ts`). All calls need the signed-in token.

| Screen | What it does | Endpoint |
| --- | --- | --- |
| Help Center tab (`/dashboard/support`) | Enquiry type dropdown and published help content | `GET /api/individual/support/options` |
| | Send an enquiry or complaint (`SupportEnquiryForm`) | `POST /api/individual/support/enquiries` |
| | Recent Support History, paged; each row opens its ticket | `GET /api/individual/support/history?page&size` |
| Feedback tab | 1–5 star rating and optional remark | `POST /api/individual/support/feedback` |
| Ticket page (`/dashboard/support/tickets/[ticketId]`) | Conversation, details and activity timeline | `GET /api/v1/support/tickets/{ticketId}` |
| | Reply (open tickets) | `POST /api/v1/support/tickets/{ticketId}/messages` |
| | Reopen with a reason (`RESOLVED` / `CLOSED` tickets) | `POST /api/v1/support/tickets/{ticketId}/reopen` |
| Transaction details ("Report an issue") | `TransactionSupportModal` raises a ticket for that transaction | `POST /api/individual/support/enquiries` |

- **Published content:** `HELP` entries show as "Helpful articles", `FAQ` entries replace the built-in FAQ list, `CONTACT` entries replace the built-in Contact Us list, and `TERMS` / `PRIVACY` entries with a URL show as links. With no published content, the built-in FAQs and contacts are shown.
- **Transaction support:** the modal starts with "Transaction issue" and today's date. It starts as a complaint when the transaction failed or is still pending. The enquiry endpoint has no transaction field, so the reference is added to the top of the remark (`Transaction reference: …`).
- **Transaction details page:** there is no single-transaction endpoint yet, so the transactions list saves the clicked row to `localStorage` (`transactionDetails`) and the details page reads it with `useSyncExternalStore`. On the server it renders a skeleton, then the details in the browser. If nothing is saved (e.g. the link was opened in a new browser), it shows "We couldn't find this transaction" with a link back to the list.
- **Idempotency:** each send uses an `Idempotency-Key` (`newIdempotencyKey()`). A retry after a failure reuses the key, and a new key is made after each success.
- **History paging:** the history endpoint returns no total, so "next page" is disabled when a page comes back short.
- **Messages:** the spec has no example message yet. A message counts as the customer's when its `authorType` / `senderType` says customer, or its author id matches the ticket's `customerId`; otherwise it shows as "Hatiso support".

---

## Contact form

The public Contact form (`/contact`; `/contact-us` redirects there) is sent to `POST /api/public/expressions-of-interest`. No sign-in is needed.

| Field | Form label | Notes |
| --- | --- | --- |
| `contactName` | Your name | Required |
| `contactRole` | Your role | Optional; left out when blank |
| `email` | Email address | Required |
| `phone` | Phone number | Required. Sent in international format: `0803 555 0212` becomes `+2348035550212` |
| `organisation` | Organisation | Required |
| `tenantType` | Organisation type | Required select: Bank, Fintech, Microfinance bank, Merchant, Other (`TENANT_TYPES`) |
| `country` | Country | Required; starts as Nigeria |
| `website` | Website | Optional; `example.com` is sent as `https://example.com` |
| `message` | Message | Required, 10 characters or more |

- **Code:** `lib/api/expressionsOfInterest.ts` (`submitExpressionOfInterest`, `buildExpressionOfInterest`, `toInternationalPhone`, `TENANT_TYPES`), the hook `useSubmitExpressionOfInterest` in `lib/queries/useExpressionsOfInterest.ts`, and `contactSchema` in `lib/validation/schemas.ts`.
- **Success:** the confirmation shows only after the API accepts the form, and the form is cleared.
- **Errors:** the API client shows the error toast, and the form keeps what was typed so it can be sent again.

---

## Home page configuration

What every visitor sees on the home page (`/`) comes from `GET /api/public/marketplace/page-configuration` (public, no sign-in). Code: `lib/api/marketplace.ts`, hooks in `lib/queries/useMarketplace.ts`, and `components/marketplace/PageSection.tsx`.

| Section id | What it controls |
| --- | --- |
| `FEATURED_DIGITAL_SERVICES` | Popular Categories (`PopularCategories`) |
| `FEATURED_BANKS` | Banks section (`BanksSection`) |
| `AUDIENCE` | The Personal tab of Solutions (`SolutionsSection`) |
| `BUSINESS` | The Business tab of Solutions. With only one of the two tabs visible, the Personal/Business switcher is hidden and that tab shows alone; with neither, the section is left out. |
| `CTA` | Call-to-action banner (`CtaBanner`) |

- **The hero always shows.** Every other section is held back until the configuration loads, so a hidden section never flashes in.
- **Only listed sections show.** Disabling a section in the admin removes it from `sections`, so a section shows only when it's listed with `visible: true`. If the configuration fails to load, every section shows, with no error toast.
- **Freshness:** the configuration is cached for a minute, so admin changes show on the next page load (or within a minute on a page left open).
- **Featured banks** (`featuredBanks`): bank ids from `GET /banks`. With a list, the Banks section shows only the visible ones, in the list's order. With an empty list it shows the first 10 banks, as before.
- **Featured services** (`featuredServices`): ids such as `AIRTIME`, `DATA`, `CABLE_TV`, `INTERNET_SERVICES`, `ELECTRICITY`, `EDUCATION`, `INSURANCE` and `OTHER_SERVICES` (each service's `featureId` in `lib/digitalServices/categoryServices.ts`). An API category (e.g. `TELCO`, giving Airtime and Data) or a service slug also match, ignoring case. With a list, the services grid shows only the visible ones, in the list's order, so a service left out of the list is hidden. With an empty list it shows every service.
- **Nothing left to show:** when a featured list is set but none of its entries can be shown (all hidden, or ids that no longer exist), that section is left out.
- **Hooks:** `useMarketplacePageConfiguration()` (cached for a minute), `useSectionVisible(id)`, and `pickFeatured(items, featured, idsOf)`.

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
| `useBanks.ts` | `useBanks` (public `GET /banks?page=0&size=100`) |
| `useAuth.ts` | `useCurrentUser`, `useUpdateProfile`, `useResetPassword`, `useForgotPassword`, `useRecoverPassword`, `useRegister`, `useResumeVerification`, `useVerifyUser`, `useResendVerification` |
| `useDashboard.ts` | `useDashboard`, `useAnalytics`, `useAnalyticsCSV` |
| `useDigitalServices.ts` | `useDigitalServiceCategories`, `useDigitalServiceCatalogues`, `useCreateDigitalServiceOrder`, `useCreatePaymentQuote`, `useCreatePayment`, `useVerifyPayment` |
| `useNotifications.ts` | `useNotifications`, `useNotificationSettings`, `useUpdateNotificationSettings` |
| `useOrders.ts` | `useDigitalServiceOrders` |
| `useMarketplace.ts` | `useMarketplacePageConfiguration`, `useSectionVisible` (public `GET /api/public/marketplace/page-configuration`) |
| `useExpressionsOfInterest.ts` | `useSubmitExpressionOfInterest` (public `POST /api/public/expressions-of-interest`) |
| `useSupport.ts` | `useSupportOptions`, `useSupportHistory`, `useSupportTicket`, `useCreateSupportEnquiry`, `useSubmitSupportFeedback`, `useReplyToSupportTicket`, `useReopenSupportTicket` |

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

- **All failed requests reject with the same `ApiError` shape** (`{ message, statusCode, errors?, code?, data? }`, in `types/index.ts`). `code` is the backend's `data.error` (e.g. `verification_required`). The axios response interceptor does this for:
  - HTTP errors
  - responses with `status: false`, even when the HTTP status is 2xx
- **The interceptor shows the error toast for you** (sonner, top-right), except:
  - on `401`, where it logs the user out instead;
  - for `verification_required`, which the login page turns into a redirect;
  - for requests sent with `{ skipErrorToast: true }` (pass it as the axios config), where the page shows the error itself.
  - Don't toast HTTP failures again in components.
  - Only toast errors your own code throws, such as `new Error(...)`. `ProfilePage` has a `notifyError` helper that does exactly this.
- **Success toasts are up to the component**: `toast.success('Profile updated.')`.

---

## Styling

- **Tailwind CSS v4**, configured through `app/globals.css`, with utility classes in JSX.
- **Font: Outfit** (the brand typeface from the Hatiso colour palette), loaded with `next/font/google` in `app/layout.tsx` as the `--font-outfit` variable, which `--font-sans` in `app/globals.css` points to. It's a variable font, so any weight from 100 to 900 works.
- **Colours are theme tokens, never raw hex.** Every colour is a Tailwind colour defined in `app/theme.css` (imported by `globals.css`), so the app can switch themes:
  - Write `bg-brand-361`, `text-tone-744`, `border-tone-98/60`, not `bg-[#E95312]`. Names are `<family>-<step>`: `brand` (orange accent), `ink` (teal/navy surfaces), `tone` (neutrals), `success`, `danger`, `warning`, `info`, `spot`. The step runs from 0 (white) to 1000 (black), like Tailwind shades.
  - The most-used ones: accent `brand-361` (#E95312) and `brand-305` (#FF6500), dark surface `ink-662` (#1B3C4A), headings `tone-744` (#20232A), muted text `ink-510` (#52617A) and `tone-405` (#7A7F8A), borders `tone-98` (#E6E3E0).
  - New colour: add a token to the `@theme` block in `theme.css` with its Classic value, and add its Hatiso value to the `[data-theme="hatiso"]` block (use only the brand palette there).
  - Use `bg-surface` for cards and panels, not `bg-white`. It's white in light mode and dark in dark mode. `text-tone-1000` is black, light in dark mode.
  - Third-party logo colours (`BillerLogo`: MTN, Glo, Airtel…) are tokens too, but no theme overrides them.
  - On a button filled with an accent colour, use `text-on-brand` for the label, not `text-white`. It stays white, except in Hatiso on dark surfaces, where the button turns Cloud and the label turns Carbon.
  - For a selected or active control (chosen tab or filter chip, request type, your own chat bubble), use `bg-selected text-on-selected` (and `border-selected`), not a dark `bg-ink-*` with `text-white`. It's the theme's dark panel colour with white text in light mode, and a light fill (Cloud in Hatiso) with a dark label in dark mode, where dark panels stay dark and a dark selected state would vanish.
  - Slate greys and the few Tailwind orange/cyan classes are re-pointed for Hatiso in `globals.css`.
- **Themes and mode** (Profile → **Appearance**), defined in `lib/theme/theme.ts`. Appearance has a **Mode** switch (Light, Dark or Match device, `MODES`) above the **Theme** cards (Hatiso Monochrome, Classic, Ocean, Forest, Plum: `THEMES`). Every theme has a light and a dark version, and the cards preview the mode on screen. Both only change the signed-in dashboard (`/dashboard/*`), which uses Hatiso Monochrome in light mode until the user picks otherwise (`DEFAULT_THEME`, `DEFAULT_MODE`); the landing, marketing and auth pages always use Classic in light mode (`BASE_THEME`, also what the server renders).
  - **Hatiso Monochrome** (the dashboard default, marked "Default" in Appearance): the brand palette from Hatiso Brand Essentials. Carbon is the accent and dark surface, Graphite is used for hover and secondary surfaces, Cloud for light backgrounds, the supporting greys for text and borders, and the brand status colours for success, error and warning. Inside dark areas (any element with a dark `ink`/`tone` background), accents turn Cloud so they stay visible.
  - **Classic**: the original teal-and-orange look, identical to before themes existed. Still selectable on the dashboard.
  - **Dark mode** (`[data-theme="<id>"][data-mode="dark"]` blocks at the end of `theme.css`):
    - **Hatiso Monochrome dark**: no orange or teal. The page background (`tone-44`) is Carbon, cards (`surface`) are Graphite, borders are grey-800, muted text is grey-400 and headings are Cloud; every tint and text token snaps to a brand grey. The accent (`brand-*`) is Cloud with Carbon labels (`on-brand`), as on Hatiso's dark areas. Status colours are the only colours, brightened for Graphite. Hatiso's "light card inside a dark area" rule applies in light mode only. The spending line is Cloud on grey-900 gridlines and the Analytics heatmap runs from grey-900 (quiet) to Cloud (busy).
    - **Classic dark**: Classic flipped to dark surfaces with light text. The orange accent stays, pale tints become dark tints of the same hue, and status colours are brightened.
    - **Ocean, Forest and Plum dark**: Classic dark with its pale accent tints and light text rotated to the theme's hue in OKLCH; each keeps its own accent.
    - In every dark version, panels that are dark in the design (sidebar, banners: any element with a dark `ink`/`tone` background) keep the theme's light-mode colours, including the Tailwind `slate`, `red` and `rose` shades, so sidebar text and hover states stay light. Slate, `red-50`/`rose-50` and `color-scheme` are switched elsewhere.
  - **Ocean** (blue), **Forest** (green) and **Plum** (violet): Classic with the accent (`brand-*`) and surface (`ink-*`) colours shifted to a new hue. Lightness and saturation stay the same, so contrast matches Classic. Warm neutral tints follow the surface hue; status and info colours don't change.
  - Both choices are saved per browser in `localStorage` (`hatiso_theme`, `hatiso_mode`) and applied as `<html data-theme data-mode>`. "Match device" follows `prefers-color-scheme` and switches live. The old "Dark" theme (a saved `hatiso_theme` of `dark`) becomes Hatiso Monochrome in dark mode:
    - On a full page load under `/dashboard`, the inline script in `app/layout.tsx` (`THEME_INIT_SCRIPT`) sets both before the first paint (the saved choices, or Hatiso light if nothing valid is saved), so there's no flash.
    - On client-side navigation, `useDashboardTheme()` in `app/dashboard/layout.tsx` applies the saved theme and mode when the dashboard opens and puts Classic light back when the user leaves it.
    - Other open dashboard tabs follow along.
  - `useTheme()` returns the active theme, `useColorMode()` the mode on screen, and `useModeChoice()` the saved choice including Match device. Canvas charts can't read CSS variables, so `SpendingChart` and the Analytics heatmap pick colours per theme and mode (ticks, gridlines and heatmap from the dark tokens in dark mode, hand-picked for Classic and Hatiso, read from the accent tokens with `themeColor()` for the hue themes). Categorical chart colours (one per service) and bank brand colours don't change.
  - Adding a theme: add it to `THEMES` (id, name, description, light and dark preview swatches), add a `[data-theme="<id>"]` block of token values in `theme.css`, and a `[data-theme="<id>"][data-mode="dark"]` block plus its dark-panel block for dark mode. The hue-theme blocks at the end of `theme.css` were generated by rotating the Classic `brand-*`/`ink-*` values in OKLCH, which is the quickest way to make another one.
- **Form and button styles live in `components/forms/styles.ts`** (`fieldControlClass`, `fieldLabelClass`, `buttonClass`, …). Use these rather than copying class strings.
- **Charts** are Chart.js wrappers in `components/dashboard/DashboardCharts.tsx`:
  - `SpendingChart`: line/area chart.
  - `ServiceUsageChart`: a pie by default; pass `donut` for the ring with rounded segments used on Analytics.
- **Auth brand panel** (`components/auth/AuthBrandPanel.tsx`) is the left side of login, register and forgot-password on desktop:
  - It stays in the viewport while the form scrolls, and the photo frame shrinks to fit shorter screens.
  - Photos live in the `SLIDES` array (`src`, `alt`, plus `position` and `zoom` to set the crop). They cross-fade inside a squircle frame every 6s.
  - Picking a slide with the dots or a swipe restarts the countdown, and it pauses while the tab is in the background.
  - The floating icon bubbles use the `auth-float*` animations in `globals.css`, which turn off when reduced motion is preferred.
- **Guest sign-up invite** (`components/marketplace/CustomerInvitePopup.tsx`):
  - When a guest closes the payment receipt on a service page ("Make another payment" or "Return to marketplace"), `ServiceDetailPage` shows the "Ready to make it official?" popup before continuing.
  - Its buttons link to `/auth/login` and `/auth/register`. Closing it (✕, Escape or the backdrop) carries on where the guest was going.
  - `shouldInviteGuest(isAuthenticated)` skips logged-in users, and guests who already saw it this browser session (`sessionStorage` key `hasito_invite_shown`).
- **Logo:** always use `components/brand/HatisoLogo.tsx`. Don't paste logo SVG into components.
  - It renders `public/brand/hatiso-logo-<variant>.svg`. Pick the variant by background, following the brand palette: `cloud` (#F1F2F4) on dark (navbar, footer, dashboard sidebar, auth brand panel, hero card), and `carbon` (#12151A) on light (mobile auth header, invite popup). `graphite`, `white` and `black` are also there.
  - Props: `height` (width follows the artwork), `href` (defaults to `/`; `null` for a plain image), `priority`.
- **Favicons and app icons** use the "cloud on carbon" set: `app/favicon.ico`, `app/icon.svg` and `app/apple-icon.png` (Next.js file conventions), the matching copies in `public/` referenced by `metadata.icons`, and the Android icons in `public/brand/icons/` listed in `app/manifest.ts`. The other icon sets (carbon on white, cloud on graphite, graphite on cloud, white on black) aren't in the repo; swap the files from the brand pack to change them.
- **Icons** come from `lucide-react`.
- **Remote images** must come from a host listed under `images.remotePatterns` in `next.config.ts`.

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
