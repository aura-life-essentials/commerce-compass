import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MilestoneData {
  milestone: string;
  currentFunding: number;
  fundingGoal: number;
  backers: number;
  equityRemaining: number;
}

const MILESTONES = [
  { percent: 10, message: "🚀 10% FUNDED! Ultra Casino is gaining momentum!" },
  { percent: 25, message: "🔥 25% FUNDED! Quarter of the way to launch!" },
  { percent: 50, message: "💎 50% FUNDED! Halfway to Web3 casino revolution!" },
  { percent: 75, message: "⚡ 75% FUNDED! Final stretch to Ultra Casino!" },
  { percent: 100, message: "🎰 FULLY FUNDED! Ultra Casino development begins!" },
];

async function postToTwitter(message: string): Promise<boolean> {
  const consumerKey = Deno.env.get("TWITTER_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("TWITTER_CONSUMER_SECRET");
  const accessToken = Deno.env.get("TWITTER_ACCESS_TOKEN");
  const accessTokenSecret = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");

  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    console.log("[SOCIAL] Twitter credentials not configured, skipping...");
    return false;
  }

  try {
    // OAuth 1.0a signature generation
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID().replace(/-/g, '');
    
    const params: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
    };

    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join("&");

    const baseString = `POST&${encodeURIComponent("https://api.twitter.com/2/tweets")}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(signingKey);
    const messageData = encoder.encode(baseString);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    
    const oauthHeader = `OAuth oauth_consumer_key="${encodeURIComponent(consumerKey)}", oauth_nonce="${nonce}", oauth_signature="${encodeURIComponent(signatureBase64)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_token="${encodeURIComponent(accessToken)}", oauth_version="1.0"`;

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Authorization": oauthHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: message }),
    });

    if (response.ok) {
      console.log("[SOCIAL] Twitter post successful");
      return true;
    } else {
      const error = await response.text();
      console.error("[SOCIAL] Twitter error:", error);
      return false;
    }
  } catch (error) {
    console.error("[SOCIAL] Twitter posting failed:", error);
    return false;
  }
}

async function postToDiscord(message: string, data: MilestoneData): Promise<boolean> {
  const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  
  if (!webhookUrl) {
    console.log("[SOCIAL] Discord webhook not configured, skipping...");
    return false;
  }

  try {
    const embed = {
      title: "🎰 Ultra Casino Funding Update",
      description: message,
      color: 0xFFB800, // Amber color
      fields: [
        {
          name: "💰 Current Funding",
          value: `$${data.currentFunding.toLocaleString()} / $${data.fundingGoal.toLocaleString()}`,
          inline: true,
        },
        {
          name: "👥 Investors",
          value: data.backers.toString(),
          inline: true,
        },
        {
          name: "📊 Equity Remaining",
          value: `${data.equityRemaining.toFixed(2)}%`,
          inline: true,
        },
      ],
      footer: {
        text: "Ultra Casino • Web3 Gaming Revolution",
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "@everyone 🚨 **MILESTONE REACHED!**",
        embeds: [embed],
      }),
    });

    if (response.ok) {
      console.log("[SOCIAL] Discord post successful");
      return true;
    } else {
      const error = await response.text();
      console.error("[SOCIAL] Discord error:", error);
      return false;
    }
  } catch (error) {
    console.error("[SOCIAL] Discord posting failed:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("[SOCIAL] Checking for milestones...");
    
    const { data: project, error } = await supabaseClient
      .from("dao_projects")
      .select("*")
      .ilike("project_name", "%Ultra Casino%")
      .single();

    if (error || !project) {
      console.log("[SOCIAL] Project not found:", error?.message);
      return new Response(JSON.stringify({ message: "Project not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const ETH_USD_RATE = 3500;
    const FUNDING_GOAL_USD = 30000;
    const currentFundingUSD = project.current_funding_eth * ETH_USD_RATE;
    const progressPercent = (project.current_funding_eth / (FUNDING_GOAL_USD / ETH_USD_RATE)) * 100;
    
    // Get stored milestone tracking
    const projectMetadata = project.metadata || {};
    const lastMilestonePosted = projectMetadata.last_milestone_posted || 0;

    // Find the next milestone to post
    const nextMilestone = MILESTONES.find(
      m => m.percent > lastMilestonePosted && progressPercent >= m.percent
    );

    if (!nextMilestone) {
      console.log("[SOCIAL] No new milestone reached");
      return new Response(JSON.stringify({ message: "No new milestone" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[SOCIAL] Milestone reached: ${nextMilestone.percent}%`);

    const milestoneData: MilestoneData = {
      milestone: nextMilestone.message,
      currentFunding: currentFundingUSD,
      fundingGoal: FUNDING_GOAL_USD,
      backers: project.total_backers || 0,
      equityRemaining: 100 - progressPercent,
    };

    const fullMessage = `${nextMilestone.message}\n\n` +
      `💰 Raised: $${currentFundingUSD.toLocaleString()} / $${FUNDING_GOAL_USD.toLocaleString()}\n` +
      `👥 Investors: ${project.total_backers || 0}\n` +
      `📊 ${progressPercent.toFixed(1)}% Complete\n\n` +
      `🎲 Invest now for equity ownership, NFT access, and lifetime VIP perks!\n` +
      `#Web3Casino #NFT #DeFi #Gaming #CryptoInvesting`;

    // Post to social platforms
    const [twitterResult, discordResult] = await Promise.all([
      postToTwitter(fullMessage),
      postToDiscord(nextMilestone.message, milestoneData),
    ]);

    // Update milestone tracking
    await supabaseClient
      .from("dao_projects")
      .update({
        metadata: {
          ...projectMetadata,
          last_milestone_posted: nextMilestone.percent,
          last_post_at: new Date().toISOString(),
        },
      })
      .eq("id", project.id);

    // Log the activity
    await supabaseClient.from("agent_logs").insert({
      agent_name: "Social Media Bot",
      agent_role: "marketing",
      action: "milestone_post",
      status: twitterResult || discordResult ? "success" : "partial",
      details: {
        milestone: nextMilestone.percent,
        twitter: twitterResult,
        discord: discordResult,
        message: fullMessage,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      milestone: nextMilestone.percent,
      twitter: twitterResult,
      discord: discordResult,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[SOCIAL] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
