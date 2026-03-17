
Goal: turn the uploaded Aura Omega artwork into a proper primary brand system and apply it consistently across the 3 main surfaces you selected: top header, homepage, and Apex sidebar.

What I found
- The current brand is inconsistent:
  - `src/components/dashboard/Header.tsx` uses a Brain icon + “CEO Brain”
  - `src/pages/MainHub.tsx` uses a separate Brain icon + “CEO Brain”
  - `src/components/web3/ApexSidebar.tsx` uses another Brain icon + “Apex OS”
- The uploaded image is visually strong, but too detailed/tall to use raw as a nav logo. Your chosen direction, “Icon + wordmark,” is the right approach.

Implementation plan
1. Create one reusable Aura Omega logo component
- Add a shared brand component, e.g. `src/components/branding/AuraOmegaLogo.tsx`
- Support variants:
  - `compact`: icon only
  - `default`: icon + wordmark
  - `stacked` or `hero`: larger presentation version for homepage/Apex areas
- Build it as:
  - circular/square app icon using a cropped treatment of the uploaded art
  - clean text lockup with “Aura Omega”
  - optional subtitle per surface, like “Universal Web3 Interface” or “Global Enterprise Hub”

2. Add the uploaded image into the app properly
- Copy the uploaded artwork into `src/assets` and import it normally
- Use it as the visual source for the icon portion only, not as a giant raw poster
- Apply masking/cropping, glow, border, and background treatment so it feels premium and readable at small sizes

3. Replace the main header branding
- Update `src/components/dashboard/Header.tsx`
- Replace the Brain badge + “CEO Brain / Revenue Command Center” with the shared Aura Omega logo
- Keep nav/actions intact
- Tighten spacing for the current mobile viewport so the logo remains usable on smaller widths

4. Rebrand the homepage main logo
- Update `src/pages/MainHub.tsx`
- Replace the current top-left Brain/CEO Brain lockup with the new Aura Omega logo
- Add a larger hero-safe version near the top so the public-facing homepage clearly carries the new brand
- Keep the dark executive styling and glassmorphism, but align copy to the Aura Omega identity

5. Rebrand the Apex sidebar/header area
- Update `src/components/web3/ApexSidebar.tsx`
- Replace the Brain/Apex OS block with the new icon + wordmark
- Preserve collapsed-sidebar behavior by showing icon-only in collapsed mode and full lockup when expanded
- Keep the sidebar readable and lightweight

6. Add brand styling tokens
- Extend `src/index.css` with a few reusable brand utilities:
  - logo frame / logo glow
  - wordmark gradient or gold-accent option
  - small-screen sizing rules for header/sidebar lockups
- Match the uploaded art palette: cosmic cyan, violet, soft gold, while still fitting the existing dark executive theme

7. Copy cleanup
- Standardize naming so the visible main brand becomes Aura Omega on these surfaces
- Keep operational descriptors as subtitles, not primary names
- Example:
  - Primary: Aura Omega
  - Secondary subtitle: Universal Web3 Interface / Enterprise Command Layer

Technical details
- Files likely to change:
  - `src/components/dashboard/Header.tsx`
  - `src/pages/MainHub.tsx`
  - `src/components/web3/ApexSidebar.tsx`
  - `src/index.css`
  - new shared component such as `src/components/branding/AuraOmegaLogo.tsx`
- Asset handling:
  - uploaded image should be copied into `src/assets`
  - imported via ES module, then used inside the reusable logo component
- Responsive behavior:
  - mobile header: icon + shortened subtitle or hidden subtitle
  - sidebar collapsed: icon only
  - homepage hero: larger branded lockup for stronger identity

Design intent
- Not a raw image pasted into the UI
- A polished brand system derived from your artwork
- More premium, app-like, and consistent across public and operator surfaces

Expected result
- One recognizable Aura Omega identity across the app
- Better first impression on homepage
- Stronger premium branding in navigation and Apex surfaces
- Cleaner mobile behavior than the current mixed icon/text setup
