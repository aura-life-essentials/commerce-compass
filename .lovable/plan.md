

## Audit Findings

After reviewing the codebase, here's what I found needs attention for true production polish:

### Critical Issues
1. **`AuthContext.tsx` exists but isn't wired into `App.tsx`** — `useAuth` is being called in multiple components separately, causing duplicate Supabase auth listeners and unnecessary re-renders.
2. **Mobile viewport (488px)** — Header navigation likely overflows on mobile. Need to verify and polish.
3. **`supabase/functions/agent-orchestrator/index.ts`** has an unsafe `supabase` reference in the catch block (declared inside `try` scope risk — actually it's outside, but error logging swallows failures silently).
4. **`/command-center` route** — User is currently viewing this; need to verify it loads cleanly with no console errors and renders the CEO dashboard properly.
5. **Dead/legacy tables** still in DB: `dao_*`, `nft_*`, `metaverse_*`, `crypto_transactions` — these conflict with the "AuraOmega Revenue OS" focus and the Zero-Fake policy. They should be hidden from UI (not dropped — keeps history) and any UI references purged.
6. **`bun.lock` was edited** — indicates dependency drift; verify nothing broke.

### Polish Opportunities
- **Glow consistency** — Some components use raw Tailwind shadows instead of `.glow-oro` / `.oro-card` utility classes.
- **Loading states** — Several hooks (`useRevenueMetrics`, `useStores`) likely show flashes of empty state before data loads. Add skeleton shimmers with Oro Omega tint.
- **Header on mobile** — Convert nav to a slide-out sheet for screens < 768px.
- **Page transitions** — Add subtle fade-in animations on route change for cinematic feel.
- **Aurora background** — Apply the `.animate-aurora` class to the main `<body>` or root layout for ambient depth on every page.

## Plan

### Step 1 — Wire AuthContext properly
Wrap `<App>` in `<AuthProvider>` inside `src/App.tsx` and refactor `ProtectedRoute`, `Header`, `MainHub`, `Auth`, `MyApps`, `SubscriptionManagement` to use `useAuthContext()` instead of calling `useAuth()` directly. Eliminates duplicate listeners.

### Step 2 — Audit & test the live preview
- Read console logs and network requests for `/command-center`
- Verify `check-subscription`, `ceo-brain`, and dashboard hooks return clean responses
- Run security linter to catch any new RLS gaps

### Step 3 — Mobile-first Header polish
Refactor `src/components/dashboard/Header.tsx`:
- Desktop: keep current horizontal nav
- Mobile (<768px): hamburger triggering a `Sheet` with the same links + auth actions
- Sticky top with backdrop blur, Oro Omega border glow

### Step 4 — Cinematic ambient background
Add a fixed-position aurora layer in `src/App.tsx` (behind all routes):
```tsx
<div className="fixed inset-0 -z-10 animate-aurora opacity-40 pointer-events-none" 
     style={{background: 'var(--gradient-oro)'}} />
```

### Step 5 — Loading states & skeletons
Update `src/components/dashboard/CEODashboard.tsx`, `RevenueChart.tsx`, `RealMetrics.tsx`, `MyApps.tsx`:
- Replace empty initial states with `<Skeleton>` shimmer using Oro Omega tinted `bg-primary/10`
- Add `<LoadingSpinner>` glow variant

### Step 6 — Page transitions
Wrap `<Routes>` in a `framer-motion`-free CSS approach — add `.animate-fade-in` (already in `index.css`) to each page's root container.

### Step 7 — Hide legacy tables from UI
Audit and remove any imports/references to `dao_*`, `nft_*`, `metaverse_*`, `crypto_transactions` from frontend components and replace with focused AuraOmega revenue features. (Tables stay in DB to preserve history.)

### Step 8 — Header glow & polish details
- Add `.glow-oro` to active nav items
- Replace generic shadows with `.oro-card` on dashboard cards
- Ensure all CTAs use the gradient primary button style

### Step 9 — Final QA pass
- Run security--run_security_scan
- Run supabase--linter
- Test `/`, `/command-center`, `/my-apps`, `/auth`, `/pricing`, `/reset-password` end-to-end
- Verify Stripe checkout still launches cleanly

### Files to be modified
- `src/App.tsx` — wrap in AuthProvider, add aurora background, page transitions
- `src/components/ProtectedRoute.tsx` — use useAuthContext
- `src/components/dashboard/Header.tsx` — mobile sheet nav, glow polish
- `src/components/dashboard/CEODashboard.tsx` — skeletons, oro-card
- `src/components/dashboard/RevenueChart.tsx` — loading state
- `src/components/dashboard/RealMetrics.tsx` — loading state
- `src/pages/MyApps.tsx` — useAuthContext, skeletons
- `src/pages/Auth.tsx` — useAuthContext
- `src/pages/MainHub.tsx` — useAuthContext, polish
- `src/pages/SubscriptionManagement.tsx` — useAuthContext
- `src/components/ui/LoadingSpinner.tsx` — Oro glow variant
- Any component referencing legacy `dao_*` / `nft_*` / `metaverse_*` / `crypto_transactions` → cleaned

### Outcome
- Single auth listener (perf win)
- Cinematic ambient aurora across every page
- Mobile nav that feels native
- No flash-of-empty-state — smooth shimmer loads
- Zero references to legacy verticals
- Verified clean console + secure RLS
- Production-ready polish at every touchpoint

