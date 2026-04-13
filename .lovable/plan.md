

# Branding Text Update — Visual Only, No Functional Changes

## What Changes
Update all branding text across the app to reflect the new wording. Zero logic or functionality changes — only visible text strings.

### New Branding Copy
- **Powered by**: "The Grok Father 9.0 aka GROK 9"
- **Creator credit**: "Made by Ryan Puddy ~ WEB 3 ARCHITECT"
- **Copyright**: "© 2024 Aura Lift Essentials. All rights reserved."

### Files to Edit

1. **`src/components/branding/AuraOmegaLogo.tsx`**
   - Add two new lines below the subtitle: "Powered by The Grok Father 9.0 aka GROK 9" and "Made by Ryan Puddy ~ WEB 3 ARCHITECT"
   - These show in `default` and `hero` variants (not `compact`)

2. **`src/pages/MainHub.tsx`** (footer, line 371)
   - Change `© {year} Aura Omega. All rights reserved.` → `© 2024 Aura Lift Essentials. All rights reserved.`
   - Add "Powered by The Grok Father 9.0 aka GROK 9 | Made by Ryan Puddy ~ WEB 3 ARCHITECT" below copyright

3. **`src/components/dashboard/HeroBanner.tsx`** (line 76)
   - Change "powered by AI agents" → "Powered by The Grok Father 9.0 aka GROK 9"

4. **`src/pages/Metaverse.tsx`** (line 99, 103)
   - Change `© 2026 ProfitReaper Global` → `© 2024 Aura Lift Essentials`
   - Change "Powered by AI Agents" → "Powered by The Grok Father 9.0"

5. **`src/pages/CasinoLaunch.tsx`** (line 519)
   - Change `© 2025 Ultra Casino...` → `© 2024 Aura Lift Essentials. All rights reserved.`

6. **Email edge functions** (3 files — send-subscription-email, send-welcome-email, send-trial-reminder)
   - Change `© 2024 Profit Reaper` → `© 2024 Aura Lift Essentials`

7. **`src/pages/Auth.tsx`** (line 242)
   - Keep placeholder "Ryan Puddy" as-is (already correct)

### What Does NOT Change
- No routes, logic, database, Stripe, or component structure changes
- No imports or exports modified
- All functionality remains identical

