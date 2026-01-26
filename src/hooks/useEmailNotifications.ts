import { supabase } from "@/integrations/supabase/client";

export const useEmailNotifications = () => {
  const sendWelcomeEmail = async (
    email: string,
    displayName?: string,
    tier?: string,
    trialDays?: number
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-welcome-email", {
        body: { email, displayName, tier, trialDays },
      });

      if (error) throw error;
      console.log("[Email] Welcome email sent:", data);
      return { success: true, data };
    } catch (error) {
      console.error("[Email] Failed to send welcome email:", error);
      return { success: false, error };
    }
  };

  const sendTrialReminder = async (
    email: string,
    daysRemaining: number,
    tier: string,
    displayName?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-trial-reminder", {
        body: { email, displayName, daysRemaining, tier },
      });

      if (error) throw error;
      console.log("[Email] Trial reminder sent:", data);
      return { success: true, data };
    } catch (error) {
      console.error("[Email] Failed to send trial reminder:", error);
      return { success: false, error };
    }
  };

  const sendSubscriptionEmail = async (
    email: string,
    tier: string,
    eventType: "activated" | "upgraded" | "downgraded" | "cancelled" | "renewed" | "payment_failed",
    displayName?: string,
    amount?: number,
    nextBillingDate?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-subscription-email", {
        body: { email, displayName, tier, eventType, amount, nextBillingDate },
      });

      if (error) throw error;
      console.log("[Email] Subscription email sent:", data);
      return { success: true, data };
    } catch (error) {
      console.error("[Email] Failed to send subscription email:", error);
      return { success: false, error };
    }
  };

  return {
    sendWelcomeEmail,
    sendTrialReminder,
    sendSubscriptionEmail,
  };
};
