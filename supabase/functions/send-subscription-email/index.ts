import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SUBSCRIPTION-EMAIL] ${step}${detailsStr}`);
};

interface SubscriptionEmailRequest {
  email: string;
  displayName?: string;
  tier: string;
  eventType: "activated" | "upgraded" | "downgraded" | "cancelled" | "renewed" | "payment_failed";
  amount?: number;
  nextBillingDate?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const { email, displayName, tier, eventType, amount, nextBillingDate }: SubscriptionEmailRequest = await req.json();

    if (!email || !eventType) {
      throw new Error("Email and eventType are required");
    }

    logStep("Sending subscription email", { email, tier, eventType });

    const userName = displayName || email.split("@")[0];
    
    const templates: Record<string, { subject: string; icon: string; headline: string; message: string; cta?: { text: string; url: string } }> = {
      activated: {
        subject: `🎉 Welcome to ${tier}! Your subscription is active`,
        icon: "🚀",
        headline: "Your Subscription is Active!",
        message: `Congratulations! Your <strong>${tier}</strong> plan is now active. All premium features are unlocked and ready for you.`,
        cta: { text: "Go to Dashboard", url: "https://auraomega.com/dashboard" }
      },
      upgraded: {
        subject: `⬆️ Upgrade Complete! Welcome to ${tier}`,
        icon: "⬆️",
        headline: "Upgrade Successful!",
        message: `You've upgraded to <strong>${tier}</strong>! Enjoy your new features and increased limits immediately.`,
        cta: { text: "Explore New Features", url: "https://auraomega.com/dashboard" }
      },
      downgraded: {
        subject: `Plan Changed to ${tier}`,
        icon: "📋",
        headline: "Plan Updated",
        message: `Your plan has been changed to <strong>${tier}</strong>. Changes will take effect at the end of your current billing period.`,
        cta: { text: "View Plan Details", url: "https://auraomega.com/subscription" }
      },
      cancelled: {
        subject: "We're sorry to see you go 😢",
        icon: "👋",
        headline: "Subscription Cancelled",
        message: `Your <strong>${tier}</strong> subscription has been cancelled. You'll continue to have access until the end of your billing period.`,
        cta: { text: "Reactivate Anytime", url: "https://auraomega.com/pricing" }
      },
      renewed: {
        subject: `✅ Your ${tier} subscription has been renewed`,
        icon: "✅",
        headline: "Subscription Renewed",
        message: `Your <strong>${tier}</strong> subscription has been successfully renewed${amount ? ` for $${(amount / 100).toFixed(2)}` : ""}.`,
        cta: { text: "View Receipt", url: "https://auraomega.com/subscription" }
      },
      payment_failed: {
        subject: "⚠️ Action Required: Payment Failed",
        icon: "⚠️",
        headline: "Payment Failed",
        message: "We couldn't process your payment. Please update your payment method to avoid service interruption.",
        cta: { text: "Update Payment Method", url: "https://auraomega.com/subscription" }
      }
    };

    const template = templates[eventType];
    const billingInfo = nextBillingDate ? `<p style="color: #888; font-size: 14px;">Next billing date: ${new Date(nextBillingDate).toLocaleDateString()}</p>` : "";

    const { data, error } = await resend.emails.send({
      from: "Aura Lift Essentials <noreply@auraomega.com>",
      to: [email],
      subject: template.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid ${eventType === 'payment_failed' ? '#ff4444' : '#333'};">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 10px;">${template.icon}</div>
                <h1 style="color: ${eventType === 'payment_failed' ? '#ff4444' : '#00ff88'}; font-size: 24px; margin: 0;">${template.headline}</h1>
              </div>
              
              <div style="color: #fff; font-size: 16px; line-height: 1.6;">
                <p>Hey ${userName},</p>
                <p>${template.message}</p>
                ${billingInfo}
                
                ${template.cta ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${template.cta.url}" style="display: inline-block; background: linear-gradient(135deg, #00ff88, #00d4ff); color: #000; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">${template.cta.text}</a>
                </div>
                ` : ""}
                
                <p style="color: #888; font-size: 14px;">Questions? Just reply to this email and we'll help you out.</p>
                <p style="color: #888;">— The Aura Lift Essentials Team</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© 2024 Aura Lift Essentials. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      logStep("Resend error", { error });
      throw error;
    }

    logStep("Email sent successfully", { messageId: data?.id, eventType });

    return new Response(JSON.stringify({ success: true, messageId: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
