import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

// Generate a unique session ID that persists for the browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Strip sensitive query params (auth tokens, sessions) before logging URLs
const SENSITIVE_PARAMS = ['__lovable_token', 'token', 'access_token', 'refresh_token', 'session', 'apikey', 'api_key'];
const getSafeUrl = (): string => {
  try {
    const url = new URL(window.location.href);
    SENSITIVE_PARAMS.forEach((p) => url.searchParams.delete(p));
    url.hash = '';
    return url.toString();
  } catch {
    return window.location.pathname;
  }
};

type EventType = 
  | 'page_view'
  | 'user_action'
  | 'conversion'
  | 'error'
  | 'engagement';

interface TrackEventOptions {
  event_type: EventType;
  event_name: string;
  event_data?: Record<string, unknown>;
}

export function useAnalytics() {
  const { session } = useAuthContext();
  const hasTrackedPageView = useRef(false);

  const trackEvent = useCallback(async ({ event_type, event_name, event_data }: TrackEventOptions) => {
    try {
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      await supabase.functions.invoke('track-analytics', {
        headers,
        body: {
          event_type,
          event_name,
          event_data,
          page_url: getSafeUrl(),
          referrer: document.referrer,
          session_id: getSessionId(),
        },
      });
    } catch (error) {
      // Silently fail analytics - don't disrupt user experience
      console.debug('Analytics tracking failed:', error);
    }
  }, [session?.access_token]);

  // Track page views
  const trackPageView = useCallback((pageName?: string) => {
    trackEvent({
      event_type: 'page_view',
      event_name: pageName || document.title || window.location.pathname,
      event_data: {
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
    });
  }, [trackEvent]);

  // Track user actions (clicks, form submissions, etc.)
  const trackAction = useCallback((actionName: string, data?: Record<string, unknown>) => {
    trackEvent({
      event_type: 'user_action',
      event_name: actionName,
      event_data: data,
    });
  }, [trackEvent]);

  // Track conversions (subscriptions, purchases, signups)
  const trackConversion = useCallback((conversionType: string, data?: Record<string, unknown>) => {
    trackEvent({
      event_type: 'conversion',
      event_name: conversionType,
      event_data: data,
    });
  }, [trackEvent]);

  // Track errors
  const trackError = useCallback((errorName: string, errorDetails?: Record<string, unknown>) => {
    trackEvent({
      event_type: 'error',
      event_name: errorName,
      event_data: errorDetails,
    });
  }, [trackEvent]);

  // Track engagement (scroll depth, time on page, etc.)
  const trackEngagement = useCallback((engagementType: string, data?: Record<string, unknown>) => {
    trackEvent({
      event_type: 'engagement',
      event_name: engagementType,
      event_data: data,
    });
  }, [trackEvent]);

  // Auto-track page view on mount (once per component instance)
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      trackPageView();
    }
  }, [trackPageView]);

  return {
    trackEvent,
    trackPageView,
    trackAction,
    trackConversion,
    trackError,
    trackEngagement,
  };
}

// Standalone function for use outside React components
export const trackEvent = async (options: TrackEventOptions) => {
  try {
    await supabase.functions.invoke('track-analytics', {
      body: {
        ...options,
        page_url: window.location.href,
        referrer: document.referrer,
        session_id: getSessionId(),
      },
    });
  } catch (error) {
    console.debug('Analytics tracking failed:', error);
  }
};
