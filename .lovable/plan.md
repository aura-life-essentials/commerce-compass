

# Complete Honest Rebuild + Branding — AuraOmega

Branding is already applied (Grok Father 9.0, Ryan Puddy, Aura Lift Essentials). This plan covers everything else from the approved rebuild that hasn't been done yet.

---

## Phase 1: Create Stripe Products

Create 2 new Stripe products with real prices:
- **Core** — $97/month
- **Pro** — $297/month
- Enterprise is contact-only (no Stripe product needed)

## Phase 2: Rewrite `subscriptionTiers.ts`

Replace all 5 fake Web3 tiers with 3 honest tiers:

| Tier | Price | Billing | Features |
|------|-------|---------|----------|
| Core | $97/mo | Monthly | Lead Qualifier Agent, Nurture Agent, basic analytics, email support |
| Pro | $297/mo | Monthly | All 5 agents, advanced workflows, priority support, full dashboard |
| Enterprise | Custom | Contact | Dedicated setup, custom integrations, white-glove onboarding |

- Remove `nftBenefits` field entirely from the type
- Remove all Web3/NFT/DAO copy
- Enterprise tier has no `priceId` — routes to `/contact`

## Phase 3: Build 5 Agent Edge Functions

Each calls xAI Grok API via existing `XAI_API_KEY`:

1. **`agent-lead-qualifier`** — Accepts lead data, returns qualification score + reasoning
2. **`agent-nurture`** — Generates personalized follow-up message sequences
3. **`agent-closer`** — Handles objection responses and checkout nudges
4. **`agent-onboarding`** — Creates welcome/setup sequences post-purchase
5. **`agent-orchestrator`** — Routes incoming tasks to the right agent

All log to `agent_logs` table. All use CORS headers. All validate input.

## Phase 4: Rewrite MainHub (Landing Page)

Strip everything fake. New structure:
- **Header**: AuraOmega logo with branding, "Get Started" + "Pricing" buttons. Remove ShopifyCartDrawer.
- **Hero**: "5 AI agents that qualify, nurture, close, and onboard your customers — while you sleep." Remove Shopify product references, "200-Agent" claims, physical product pillars.
- **Agent showcase**: 5 cards showing each real agent with honest descriptions
- **Pricing preview**: 3 tiers inline (Core, Pro, Enterprise)
- **CTA section**: Clean conversion block
- **Footer**: Keep legal links, update branding (already done)

Remove imports: `useShopifyProducts`, `useStores`, `ShopifyProductCard`, `ShopifyCartDrawer`, `appMonetization`

## Phase 5: Clean App.tsx Routes

**Remove these routes and imports:**
- `/store`, `/product/:handle`, `/product-legacy/:productId` (Shopify store)
- `/orders`, `/wishlist` (consumer e-commerce)
- `/casino` (CasinoLaunch)
- `/metaverse` (Metaverse)
- `/web3-launch` (Web3LaunchCenter)
- `/industry-roadmaps` (IndustryRoadmaps)
- `/apps`, `/app-monetizer` (AppStore, AppMonetizer)
- Remove `useCartSync` from AppContent

**Keep:**
- `/` (MainHub), `/command-center`, `/pricing`, `/subscription`, `/auth`
- `/contact`, `/checkout-success`, `/subscription-success`, `/welcome`, `/about`
- `/viral-engine`, `/content-factory`, `/war-room`, `/bot-swarm`, `/marketing-blitz`
- `/connectivity`, `/system-health`, `/command-center/leads`
- Legal pages, NotFound

## Phase 6: Rewrite Pricing Page

- Remove all NFT/DAO/Web3 copy ("Multi-Platform NFT Listings", "DAO Governance Rights", "Revenue Share NFTs", etc.)
- Update hero: "Autonomous Revenue Operating System" — honest about what each tier includes
- PricingSection: Show 3 tiers. Enterprise shows "Contact Us" button linking to `/contact` instead of Stripe checkout
- Remove bottom text about "NFT membership passes tradeable on OpenSea"

## Phase 7: Update Dashboard (Index.tsx)

- Add `AgentStatusPanel` component showing real `agent_logs` data for the 5 named agents
- Keep existing working panels (RealMetrics, RealTimeFeed, CEODashboard, etc.)
- Remove MetaverseHub and Web3Dashboard imports if they reference removed functionality

## Phase 8: New Component — `AgentStatusPanel.tsx`

Shows the 5 agents with:
- Name and role
- Last activity timestamp (from `agent_logs`)
- Tasks completed count
- Status indicator (active/idle)
- Real data only — falls back to "No activity yet" if no logs exist

---

## What Gets Removed
- All Shopify product grids and store references from MainHub
- All NFT/DAO/Web3 claims from pricing
- All 5 old subscription tiers (replaced with 3)
- Routes to casino, metaverse, web3-launch, store, orders, wishlist, apps, app-monetizer, industry-roadmaps
- "200-Agent" and fake revenue claims
- `useCartSync` hook usage in AppContent

## What Stays Untouched
- Auth system, ProtectedRoute, AuthContext
- Stripe webhook/checkout/subscription infrastructure
- Database tables and RLS policies
- xAI Gateway edge function
- All admin dashboard panels that show real data
- Branding (already updated)
- Legal pages, contact page

