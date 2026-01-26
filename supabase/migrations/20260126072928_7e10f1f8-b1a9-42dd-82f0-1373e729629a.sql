-- =====================================================
-- MAXIMUM SECURITY LOCKDOWN - ALL OPERATIONAL TABLES
-- Only service_role (backend) can access these tables
-- =====================================================

-- 1. AGENT_LOGS - Lock down operational logs
DROP POLICY IF EXISTS "Allow public insert to agent_logs" ON public.agent_logs;
DROP POLICY IF EXISTS "Allow public read access to agent_logs" ON public.agent_logs;

CREATE POLICY "Service role only read agent_logs" 
ON public.agent_logs FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert agent_logs" 
ON public.agent_logs FOR INSERT TO service_role WITH CHECK (true);

-- 2. AGENT_BRAINS - Lock down AI brain data
DROP POLICY IF EXISTS "Public read agent_brains" ON public.agent_brains;
DROP POLICY IF EXISTS "Public insert agent_brains" ON public.agent_brains;
DROP POLICY IF EXISTS "Public update agent_brains" ON public.agent_brains;

CREATE POLICY "Service role only read agent_brains" 
ON public.agent_brains FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert agent_brains" 
ON public.agent_brains FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only update agent_brains" 
ON public.agent_brains FOR UPDATE TO service_role USING (true);

-- 3. AI_DECISIONS - Lock down AI decision history
DROP POLICY IF EXISTS "Public read ai_decisions" ON public.ai_decisions;
DROP POLICY IF EXISTS "Public insert ai_decisions" ON public.ai_decisions;

CREATE POLICY "Service role only read ai_decisions" 
ON public.ai_decisions FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert ai_decisions" 
ON public.ai_decisions FOR INSERT TO service_role WITH CHECK (true);

-- 4. REVENUE_METRICS - Lock down financial data
DROP POLICY IF EXISTS "Allow public read access to revenue_metrics" ON public.revenue_metrics;
DROP POLICY IF EXISTS "Allow public insert to revenue_metrics" ON public.revenue_metrics;
DROP POLICY IF EXISTS "Allow public update to revenue_metrics" ON public.revenue_metrics;

CREATE POLICY "Service role only read revenue_metrics" 
ON public.revenue_metrics FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert revenue_metrics" 
ON public.revenue_metrics FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only update revenue_metrics" 
ON public.revenue_metrics FOR UPDATE TO service_role USING (true);

-- 5. MARKETING_CAMPAIGNS - Lock down marketing intelligence
DROP POLICY IF EXISTS "Public read marketing_campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Public insert marketing_campaigns" ON public.marketing_campaigns;
DROP POLICY IF EXISTS "Public update marketing_campaigns" ON public.marketing_campaigns;

CREATE POLICY "Service role only read marketing_campaigns" 
ON public.marketing_campaigns FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert marketing_campaigns" 
ON public.marketing_campaigns FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only update marketing_campaigns" 
ON public.marketing_campaigns FOR UPDATE TO service_role USING (true);

-- 6. GOVERNANCE_EVENTS - Lock down system governance
DROP POLICY IF EXISTS "Allow public read access to governance_events" ON public.governance_events;
DROP POLICY IF EXISTS "Allow public insert to governance_events" ON public.governance_events;
DROP POLICY IF EXISTS "Allow public update to governance_events" ON public.governance_events;

CREATE POLICY "Service role only read governance_events" 
ON public.governance_events FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert governance_events" 
ON public.governance_events FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only update governance_events" 
ON public.governance_events FOR UPDATE TO service_role USING (true);

-- 7. SYNC_JOBS - Lock down sync operations
DROP POLICY IF EXISTS "Allow public read access to sync_jobs" ON public.sync_jobs;
DROP POLICY IF EXISTS "Allow public insert to sync_jobs" ON public.sync_jobs;
DROP POLICY IF EXISTS "Allow public update to sync_jobs" ON public.sync_jobs;

CREATE POLICY "Service role only read sync_jobs" 
ON public.sync_jobs FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert sync_jobs" 
ON public.sync_jobs FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only update sync_jobs" 
ON public.sync_jobs FOR UPDATE TO service_role USING (true);

-- 8. TRAFFIC_WEBHOOKS - Lock down traffic analytics
DROP POLICY IF EXISTS "Public read traffic_webhooks" ON public.traffic_webhooks;
DROP POLICY IF EXISTS "Public insert traffic_webhooks" ON public.traffic_webhooks;

CREATE POLICY "Service role only read traffic_webhooks" 
ON public.traffic_webhooks FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert traffic_webhooks" 
ON public.traffic_webhooks FOR INSERT TO service_role WITH CHECK (true);

-- 9. VIRAL_CONTENT - Lock down content intelligence
DROP POLICY IF EXISTS "Public read viral_content" ON public.viral_content;
DROP POLICY IF EXISTS "Public insert viral_content" ON public.viral_content;

CREATE POLICY "Service role only read viral_content" 
ON public.viral_content FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert viral_content" 
ON public.viral_content FOR INSERT TO service_role WITH CHECK (true);

-- 10. GLOBAL_MARKETS - Lock down market expansion data
DROP POLICY IF EXISTS "Public read global_markets" ON public.global_markets;
DROP POLICY IF EXISTS "Public insert global_markets" ON public.global_markets;
DROP POLICY IF EXISTS "Public update global_markets" ON public.global_markets;

CREATE POLICY "Service role only read global_markets" 
ON public.global_markets FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert global_markets" 
ON public.global_markets FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only update global_markets" 
ON public.global_markets FOR UPDATE TO service_role USING (true);

-- 11. NOTIFICATIONS - Lock down system notifications
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow inserts for notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow updates for notifications" ON public.notifications;

CREATE POLICY "Service role only read notifications" 
ON public.notifications FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role only insert notifications" 
ON public.notifications FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only update notifications" 
ON public.notifications FOR UPDATE TO service_role USING (true);

-- 12. PRODUCTS - Keep public read for storefront, lock down writes
DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
-- Keep: "Allow public read access to products" for storefront

CREATE POLICY "Service role only insert products" 
ON public.products FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role only update products" 
ON public.products FOR UPDATE TO service_role USING (true);