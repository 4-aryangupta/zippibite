# ZippBite Frontend Auth Integration & Enhancement

## Background

After a thorough audit of the codebase, the **core integration already exists** — `api/api.js`, `context/AppContext.jsx`, and all components are already wired for auth. The task is to **harden**, **polish**, and **fill the gaps** without touching the existing UI design.

## What's Already Done 

- Centralized Axios instance at `src/api/api.js` (baseURL `/api` via Vite proxy, `withCredentials: true`)
- `AppContext.jsx` — login / signup / logout / getMe / cart / toast all implemented
- `AuthModal.jsx` — loading state, error display, floating-label inputs, tab-switching
- `Navbar.jsx` — user dropdown, logout, cart count badge
- `PrivateRoute` + `AdminRoute` — session-guarded routing
- All pages use `useAuth()` / `useCart()` / API calls correctly

## Gaps & Improvements to Implement

### 1. API Layer — Interceptors & Resilience
`src/api/api.js` is missing:
- **Response interceptor**: auto-redirect to `/` + clear user on 401 (expired JWT)
- **Request deduplication guard**: prevent concurrent duplicate POST calls
- The base URL should explicitly set `http://localhost:5000/api` for direct backend calls (currently uses Vite proxy `/api` — fine in dev, but interceptor reference to router needed)

### 2. Auth Loading Screen — Polish
`App.jsx` `PrivateRoute` shows plain "Loading…" text during the `getMe` check. Replace with a minimal, branded full-screen spinner matching the ZippBite aesthetic (orange pulse animation).

### 3. Password Visibility Toggle
`AuthModal.jsx` lacks a show/hide password button. This is a standard UX expectation.

### 4. Field-Level Validation Feedback
Currently errors are shown only after submit. Add real-time inline validation hints (e.g., password < 6 chars shows a helper text as user types) without changing form layout.

### 5. Custom Hooks — `hooks/` Directory
Create reusable data-fetching hooks to keep pages clean and avoid duplicated try/catch patterns:
- `useRestaurants(params)` — wraps restaurant API call with loading/error state
- `useOrderHistory()` — wraps past orders fetch with auth check

### 6. Global 401 Interceptor → Session Expiry UX
When a protected API call returns 401, the app should:
1. Clear the user from context
2. Show a toast: "Session expired — please log in again"
3. Redirect to `/`

Currently nothing handles this — the user just gets a silent error.

### 7. Cart Page Mobile Responsiveness
`CartPage.jsx` uses `gridTemplateColumns: '1fr min(380px,100%)'` which stacks awkwardly on mobile. Add a media-query-aware layout switch.

### 8. Axios `withCredentials` Absolute URL Fix
The `vite.config.js` proxy handles `/api` in dev — this is correct. However the Axios instance should also export a typed helper for easy future switching. Minor refactor for clarity.

### 9. Auth Context — Error Normalization
Currently `login()` / `signup()` in `AppContext.jsx` can throw raw axios errors. Normalize error messages in context so components only need to catch a `{ message }` object.

### 10. `main.jsx` — StrictMode + AppProvider Ordering
Verify `main.jsx` is correct and that `BrowserRouter` + `AppProvider` wrapping order supports future suspense/lazy routing.

---

## Proposed Changes

### API Layer

#### [MODIFY] [api.js](file:///c:/Users/aryan/Downloads/Food%20delivery%20application%20-%20zippbite/client/src/api/api.js)
- Add Axios response interceptor for 401 → dispatch session-expired event
- Export a typed `apiClient` default alongside named endpoint functions
- Add request interceptor to set `Accept: application/json` header

---

### Context

#### [MODIFY] [AppContext.jsx](file:///c:/Users/aryan/Downloads/Food delivery application - zippbite/client/src/context/AppContext.jsx)
- Listen for session-expired event from interceptor → clear user + show toast + navigate
- Normalize errors in `login()` / `signup()` to always throw `{ message: string }`
- Export `useToast()` hook for programmatic toasts without the `window.__showToast` hack

---

### New Hooks

#### [NEW] `src/hooks/useRestaurants.js`
Custom hook: `useRestaurants(params)` → `{ restaurants, loading, error, refetch }`

#### [NEW] `src/hooks/useOrderHistory.js`
Custom hook: `useOrderHistory()` → `{ orders, loading }`, only fetches when user is logged in

---

### Components

#### [MODIFY] [AuthModal.jsx](file:///c:/Users/aryan/Downloads/Food%20delivery%20application%20-%20zippbite/client/src/components/AuthModal.jsx)
- Add password visibility toggle button (eye icon inside field)
- Add real-time password length hint (< 6 chars shows soft warning)
- Prevent double submission (already has `loading` guard but add `disabled` correctly on all inputs during load)

#### [MODIFY] [App.jsx](file:///c:/Users/aryan/Downloads/Food%20delivery%20application%20-%20zippbite/client/src/App.jsx)
- Replace "Loading…" in `PrivateRoute` with a branded `<AppLoader />` component
- Add the same for `AdminRoute`

#### [NEW] `src/components/AppLoader.jsx`
Branded full-screen loading spinner:
- ZippBite logo + animated orange pulse ring
- Matches the dark theme, no layout impact

---

### Pages

#### [MODIFY] [CartPage.jsx](file:///c:/Users/aryan/Downloads/Food%20delivery%20application%20-%20zippbite/client/src/pages/CartPage.jsx)
- Add mobile-responsive grid collapse (`@media` check or CSS var strategy)
- Bill summary stacks below cart items on narrow screens

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/aryan/Downloads/Food%20delivery%20application%20-%20zippbite/client/src/pages/Dashboard.jsx)
- Use new `useRestaurants` hook instead of direct API call
- Improve skeleton loader cards (add shimmer animation instead of simple pulse)

---

## Strict Rules Followed

-  No UI redesign — colors, spacing, glassmorphism all preserved exactly
-  No new visual layouts — only logic improvements
-  No new routes or pages (except `AppLoader` which is internal)
-  All changes are additive or hardening existing code

## Verification Plan

### Automated
- Verify dev server starts: `npm run dev` in `/client`
- Verify server starts: `node server.js` in `/server`

### Manual Flow Tests
1. **Signup** → fill form → submit → redirect to `/dashboard`, user shown in navbar
2. **Login** → submit → redirect, session persists on refresh (getMe call)
3. **Logout** → user cleared, redirect to `/`
4. **401 handling** → manually expire cookie → protected API call → toast + redirect
5. **Cart mobile** → resize to < 768px → bill summary stacks below items
6. **Password toggle** → click eye → password visible/hidden
7. **Loading state** → `/dashboard` direct URL load → branded spinner shows briefly

## Open Questions

> [!IMPORTANT]
> Do you want the `useRestaurants` hook to replace the direct API call in `Dashboard.jsx`, or keep Dashboard as-is and only add the hook for new pages? (Current Dashboard works fine — this is optional refactoring)

> [!NOTE]
> The `localStorage.setItem('userName', ...)` in AppContext is redundant since `user` state is loaded from `getMe()` on refresh. Should this be removed to avoid stale localStorage data? Recommend: yes, remove it.
