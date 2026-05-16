
# One Bank, One Brain: Revenue-Only Blitz Plan

## 1. The Stripe Account = Your Bank Endpoint

You have **one Stripe account connected in LIVE mode** (confirmed via balance check just now — it's live, USD, real money rails). Every checkout, subscription, payment link, and webhook in this project already points to it via `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`.

**This is your single bank endpoint.** All Aura Omegas Grok agents, marketing blitzes, Shopify orders, and SaaS subscriptions will be force-routed here. No other Stripe key will be accepted.

**How you access it:**
- Go to **dashboard.stripe.com** → log in with the email tied to this account → that's your bank.
- Inside Lovable, click the **Payments** tab (left sidebar) → opens the same account scoped to this project.
- Payouts hit the bank account configured under **Stripe → Settings → Payouts**. Verify that's your real bank before we blitz.

I will lock this Stripe account as the sole revenue endpoint and reject any agent action that doesn't terminate in a Stripe charge.

## 2. The "Money-Or-It-Didn't-Happen" Rule

New core constraint enforced across every agent and edge function:

```text
Agent Action Validity = (Stripe charge.succeeded webhook fired)
                        AND (amount > 0)
                        AND (destination = primary Stripe account)
```

Implementation:
- Add `revenue_attribution` table: every agent log row must reference a `stripe_payment_intent_id` to be marked `effective = true`.
- Marketing blitz campaigns get a **mandatory Stripe payment link** attached at creation — no link, no launch.
- Self-healing engine flips any agent producing zero revenue in 24h to `paused`.
- Dashboard KPI swaps "actions taken" → "dollars landed."

## 3. Cloud + Connector Sync (Google, Azure, AWS, LLMs)

You already have the pieces. Here's how they snap together into one routed system:

```text
                   ┌─────────────────────────────┐
                   │  AURA OMEGAS GROK (xAI)     │ ← brain
                   └──────────────┬──────────────┘
                                  │ orchestrates
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
   ┌────▼────┐              ┌─────▼─────┐             ┌─────▼─────┐
   │ Google  │              │   Azure   │             │    AWS    │
   │ Cloud   │              │  / OpenAI │             │EventBridge│
   │ (API +  │              │ (LLM      │             │ + S3      │
   │ YouTube)│              │  fallback)│             │ (Shopify  │
   └────┬────┘              └─────┬─────┘             │  webhooks)│
        │                         │                   └─────┬─────┘
        └─────────────────────────┼─────────────────────────┘
                                  │ all outputs
                          ┌───────▼────────┐
                          │  Lovable Cloud │
                          │  (Supabase)    │
                          └───────┬────────┘
                                  │ every action MUST end in
                          ┌───────▼────────┐
                          │     STRIPE     │  ← your bank
                          │  (live, USD)   │
                          └────────────────┘
```

**Sync work (in order):**

1. **Google Cloud** — register `GOOGLE_DEVELOPER_API_KEY` as the auth for YouTube auto-posting + Search Console intel. Add a `google-cloud-sync` edge function that pushes blitz video metadata + reads search trends back to Supabase.
2. **Azure / OpenAI** — `OPENAI_MASTER_API_KEY` becomes the arbiter in the multi-AI consensus (already wired); Azure-hosted models added as a 3rd vote when Grok + GPT disagree. Pure failover, no new keys.
3. **AWS EventBridge** — already routing Shopify webhooks. Extend the rule to also forward `stripe.charge.succeeded` events into Supabase so the East-region cluster mirrors revenue events for low-latency dashboards.
4. **Connectors (Firecrawl, Perplexity, ElevenLabs, Resend, Linear)** — all already gateway-routed. I'll add a single `connector-health` cron that pings each via `verify_credentials` every 15 min and posts red/green to `/system-health`.
5. **One Endpoint** — every edge function gets refactored to call a new `revenue-router` function. Anything that doesn't pass through `revenue-router` → rejected at deploy time.

## 4. Blitz + Swarm Launch (Tonight)

After sync lands:
- Generate Stripe payment links for the 5 hero products + 3 SaaS tiers (using the existing prices).
- Inject those links into every campaign in `organic_campaigns` (currently 20 queued).
- Fire TikTok / IG / X / Facebook posts via `marketing-blitz` with link-tracked UTMs.
- Grok agents auto-DM warm leads from `lead_vault` with the same links.
- Live revenue feed on `/command-center` shows dollars landing in real time.

## 5. Technical Section (skip if not into it)

- New table: `revenue_attribution(id, agent_id, campaign_id, stripe_payment_intent_id, amount_cents, effective_at)`.
- New edge function: `revenue-router` — single entry, validates Stripe target, writes attribution row.
- New edge function: `connector-health` — cron every 15 min, hits `/api/v1/verify_credentials` per connector.
- Migration: add `requires_stripe_link boolean default true` to `organic_campaigns`; CHECK trigger blocks insert without link.
- Refactor `marketing-blitz`, `grok-ceo-override`, `viral-growth-engine` to call `revenue-router` before logging "success".
- Stripe webhook `charge.succeeded` → upsert into `revenue_attribution` and broadcast on Supabase Realtime channel `revenue:live`.
- Dashboard widget `<LiveRevenueTicker/>` subscribes to that channel.

## What I need from you

1. **Confirm the connected Stripe account is the one tied to your real bank** (open dashboard.stripe.com → Settings → Payouts → check the bank). Reply "bank confirmed" and I build everything above.
2. Want me to also kill any lingering test-mode Stripe code paths? (Recommended — yes by default.)

Once you confirm, I execute steps 1–5 in one pass and we blitz tonight.
