-- Recreate views with security_invoker = true (enforces caller's RLS)
DROP VIEW IF EXISTS public.dao_votes_public;
CREATE VIEW public.dao_votes_public
WITH (security_invoker = true) AS
SELECT id, proposal_id, vote_direction, vote_power, voted_at,
       voter_wallet, tx_hash,
       NULL::uuid AS voter_user_id
FROM public.dao_votes;
GRANT SELECT ON public.dao_votes_public TO anon, authenticated;

DROP VIEW IF EXISTS public.nft_memberships_public;
CREATE VIEW public.nft_memberships_public
WITH (security_invoker = true) AS
SELECT id, contract_address, token_id, tier, owner_wallet,
       price_eth, list_price_eth, is_listed, royalty_percent,
       total_royalties_earned, image_url, metadata_uri, benefits, minted_at,
       NULL::uuid AS owner_user_id
FROM public.nft_memberships;
GRANT SELECT ON public.nft_memberships_public TO anon, authenticated;

-- The views need to read past RLS for public exposure; allow anon SELECT on parent tables
-- but only via the views by granting SELECT on specific columns through the view layer.
-- Since security_invoker=true means views inherit caller RLS, we must add anon-friendly
-- SELECT policies on the underlying tables that match what the views expose.
CREATE POLICY "Public can view dao_votes (no user id)"
  ON public.dao_votes FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view nft_memberships (no user id)"
  ON public.nft_memberships FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read active promo codes (no stripe id)"
  ON public.promo_codes FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until >= now())
  );

-- Drop redundant service_role "FOR ALL ... USING (true)" policies (service_role bypasses RLS)
DROP POLICY IF EXISTS "Service role manages contributions" ON public.project_contributions;
DROP POLICY IF EXISTS "Service role manages realtime messages" ON realtime.messages;
DROP POLICY IF EXISTS "Service role manages ai_decisions" ON public.ai_decisions;
DROP POLICY IF EXISTS "Service role manages agent_brains" ON public.agent_brains;
DROP POLICY IF EXISTS "Service role manages promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Service role manages metaverse spaces" ON public.metaverse_spaces;
DROP POLICY IF EXISTS "Service role manages dao_votes" ON public.dao_votes;
DROP POLICY IF EXISTS "Service role manages nft_memberships" ON public.nft_memberships;