import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

interface WelcomeEmailRequest {
  email: string;
  displayName?: string;
  tier?: string;
  trialDays?: number;
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
    const { email, displayName, tier, trialDays }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    logStep("Sending welcome email", { email, tier, trialDays });

    const userName = displayName || email.split("@")[0];
    const tierName = tier || "Starter";
    const trialMessage = trialDays 
      ? `You have a <strong>${trialDays}-day free trial</strong> to explore all features.`
      : "";

    const { data, error } = await resend.emails.send({
      from: "Aura Lift Essentials <noreply@auraomega.com>",
      to: [email],
      subject: `Welcome to Aura Lift Essentials${tier ? ` - ${tierName} Plan` : ""}! 🚀`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid #333;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #00ff88; font-size: 28px; margin: 0;">Welcome to Aura Lift Essentials</h1>
                <p style="color: #888; font-size: 16px; margin-top: 10px;">Your AI-Powered Commerce Empire Starts Now</p>
              </div>
              
              <div style="color: #fff; font-size: 16px; line-height: 1.6;">
                <p>Hey ${userName}! 👋</p>
                
                <p>You've just unlocked access to the most powerful autonomous commerce platform on the planet.</p>
                
                ${trialMessage ? `<p style="background: linear-gradient(90deg, #00ff88, #00d4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold;">${trialMessage}</p>` : ""}
                
                <div style="background: rgba(0, 255, 136, 0.1); border-left: 4px solid #00ff88; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #00ff88; margin: 0 0 10px 0;">Your ${tierName} Plan Includes:</h3>
                  <ul style="color: #ccc; margin: 0; padding-left: 20px;">
                    <li>AI-Powered Sales Agents</li>
                    <li>Autonomous Marketing Engine</li>
                    <li>Real-time Analytics Dashboard</li>
                    <li>24/7 Store Monitoring</li>
                  </ul>
                </div>
                
                <p>Ready to start generating revenue on autopilot?</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://auraomega.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #00ff88, #00d4ff); color: #000; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">Launch Your Dashboard →</a>
                </div>
                
                <p style="color: #888; font-size: 14px;">If you have any questions, just reply to this email. We're here to help you succeed.</p>
                
                <p style="color: #888;">— The Aura Lift Essentials Team</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© 2024 Aura Lift Essentials. All rights reserved.</p>
              <p>
                <a href="https://auraomega.com/unsubscribe" style="color: #888;">Unsubscribe</a> | 
                <a href="https://auraomega.com/privacy" style="color: #888;">Privacy Policy</a>
              </p>
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
