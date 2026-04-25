-- 1. ai_decisions: restrict SELECT to admins/service_role; remove from realtime
DROP POLICY IF EXISTS "Authenticated users can view ai_decisions" ON public.ai_decisions;

CREATE POLICY "Admins can view ai_decisions"
  ON public.ai_decisions FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role manages ai_decisions"
  ON public.ai_decisions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime DROP TABLE public.ai_decisions;

-- 2. agent_brains: restrict SELECT to admins/service_role; remove from realtime
DROP POLICY IF EXISTS "Authenticated users can view agent_brains" ON public.agent_brains;

CREATE POLICY "Admins can view agent_brains"
  ON public.agent_brains FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role manages agent_brains"
  ON public.agent_brains FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime DROP TABLE public.agent_brains;

-- 3. promo_codes: hide stripe_coupon_id from public; expose safe view
DROP POLICY IF EXISTS "Public can read active promo codes" ON public.promo_codes;

CREATE POLICY "Admins can read promo codes"
  ON public.promo_codes FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Service role manages promo codes"
  ON public.promo_codes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE VIEW public.promo_codes_public
WITH (security_invoker = true) AS
SELECT id, code, description, discount_type, discount_value,
       applicable_tiers, valid_from, valid_until, max_uses, current_uses, is_active
FROM public.promo_codes
WHERE is_active = true
  AND (valid_from IS NULL OR valid_from <= now())
  AND (valid_until IS NULL OR valid_until >= now());

GRANT SELECT ON public.promo_codes_public TO anon, authenticated;

-- 4. metaverse_spaces: respect access_level
DROP POLICY IF EXISTS "Spaces are public" ON public.metaverse_spaces;

CREATE POLICY "Public spaces visible to all"
  ON public.metaverse_spaces FOR SELECT TO anon, authenticated
  USING (access_level = 'public');

CREATE POLICY "Owners and admins see all their spaces"
  ON public.metaverse_spaces FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Service role manages metaverse spaces"
  ON public.metaverse_spaces FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5. dao_votes: hide voter_user_id from public via view
DROP POLICY IF EXISTS "Votes are public" ON public.dao_votes;

CREATE POLICY "Owners and admins view dao_votes"
  ON public.dao_votes FOR SELECT TO authenticated
  USING (auth.uid() = voter_user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Service role manages dao_votes"
  ON public.dao_votes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE VIEW public.dao_votes_public
WITH (security_invoker = false) AS
SELECT id, proposal_id, vote_direction, vote_power, voted_at,
       voter_wallet, tx_hash,
       NULL::uuid AS voter_user_id
FROM public.dao_votes;

GRANT SELECT ON public.dao_votes_public TO anon, authenticated;

-- 6. nft_memberships: hide owner_user_id from public via view
DROP POLICY IF EXISTS "NFTs are publicly viewable" ON public.nft_memberships;

CREATE POLICY "Owners and admins view nft_memberships"
  ON public.nft_memberships FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Service role manages nft_memberships"
  ON public.nft_memberships FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE VIEW public.nft_memberships_public
WITH (security_invoker = false) AS
SELECT id, contract_address, token_id, tier, owner_wallet,
       price_eth, list_price_eth, is_listed, royalty_percent,
       total_royalties_earned, image_url, metadata_uri, benefits, minted_at,
       NULL::uuid AS owner_user_id
FROM public.nft_memberships;

GRANT SELECT ON public.nft_memberships_public TO anon, authenticated;