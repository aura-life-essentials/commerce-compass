export type LaunchChannel = {
  key: string;
  label: string;
  category: "social" | "direct" | "partner";
  description: string;
};

export const LAUNCH_CHANNELS: LaunchChannel[] = [
  { key: "social_reddit", label: "Reddit", category: "social", description: "Value-first text posts in relevant subreddits." },
  { key: "social_instagram", label: "Instagram", category: "social", description: "Carousels & captions with hashtags." },
  { key: "social_youtube", label: "YouTube Shorts", category: "social", description: "60-second vertical scripts." },
  { key: "social_pinterest", label: "Pinterest", category: "social", description: "Keyword-rich pins linking to SEO pages." },
  { key: "social_facebook", label: "Facebook", category: "social", description: "Story-led long-form posts." },
  { key: "social_x", label: "X (Twitter)", category: "social", description: "Numbered threads." },
  { key: "social_tiktok", label: "TikTok", category: "social", description: "Punchy 30-45s scripts." },
  { key: "social_linkedin", label: "LinkedIn", category: "social", description: "Pro-tone story posts." },
  { key: "email", label: "Email", category: "direct", description: "Outbound email campaigns from your domain." },
  { key: "sms", label: "SMS", category: "direct", description: "Twilio-based SMS blasts (opt-in only)." },
  { key: "influencer", label: "Influencer Outreach", category: "partner", description: "Agents propose & negotiate creator deals." },
];

export const SOCIAL_CHANNEL_KEYS = LAUNCH_CHANNELS.filter((c) => c.category === "social").map((c) => c.key);

export const platformFromChannel = (channelKey: string) =>
  channelKey.startsWith("social_") ? channelKey.slice("social_".length) : null;