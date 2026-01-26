import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-TRIAL-REMINDER] ${step}${detailsStr}`);
};

interface TrialReminderRequest {
  email: string;
  displayName?: string;
  daysRemaining: number;
  tier: string;
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
    const { email, displayName, daysRemaining, tier }: TrialReminderRequest = await req.json();

    if (!email || daysRemaining === undefined) {
      throw new Error("Email and daysRemaining are required");
    }

    logStep("Sending trial reminder", { email, daysRemaining, tier });

    const userName = displayName || email.split("@")[0];
    const urgency = daysRemaining <= 1 ? "🔴" : daysRemaining <= 2 ? "🟡" : "🟢";
    const subject = daysRemaining === 0 
      ? `${urgency} Your trial ends today!`
      : daysRemaining === 1 
        ? `${urgency} Only 1 day left on your trial`
        : `${urgency} ${daysRemaining} days left on your Profit Reaper trial`;

    const { data, error } = await resend.emails.send({
      from: "Profit Reaper <noreply@profitreaper.com>",
      to: [email],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid ${daysRemaining <= 1 ? '#ff4444' : '#333'};">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 10px;">${daysRemaining <= 1 ? '⏰' : '📊'}</div>
                <h1 style="color: ${daysRemaining <= 1 ? '#ff4444' : '#00ff88'}; font-size: 24px; margin: 0;">
                  ${daysRemaining === 0 ? 'Your Trial Ends Today!' : `${daysRemaining} Day${daysRemaining !== 1 ? 's' : ''} Left`}
                </h1>
              </div>
              
              <div style="color: #fff; font-size: 16px; line-height: 1.6;">
                <p>Hey ${userName},</p>
                
                ${daysRemaining <= 1 
                  ? `<p style="color: #ff8888;">Your free trial of the <strong>${tier}</strong> plan is about to expire. Don't lose access to your AI agents and autonomous commerce tools!</p>`
                  : `<p>Just a friendly reminder that your <strong>${tier}</strong> trial has ${daysRemaining} days remaining.</p>`
                }
                
                <div style="background: rgba(0, 255, 136, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #00ff88; margin: 0 0 15px 0;">What you'll keep with ${tier}:</h3>
                  <ul style="color: #ccc; margin: 0; padding-left: 20px;">
                    <li>All AI agents working 24/7</li>
                    <li>Autonomous marketing campaigns</li>
                    <li>Revenue analytics & insights</li>
                    <li>Priority support access</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://profitreaper.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #00ff88, #00d4ff); color: #000; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">Continue Your Plan →</a>
                </div>
                
                <p style="color: #888; font-size: 14px;">Your card will be charged automatically when the trial ends. Cancel anytime from your dashboard if you prefer not to continue.</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© 2024 Profit Reaper. All rights reserved.</p>
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

    logStep("Email sent successfully", { messageId: data?.id });

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
