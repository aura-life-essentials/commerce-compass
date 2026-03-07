import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  price?: number;
  productName?: string;
}

/**
 * Updates document head meta tags for SEO.
 * Since this is a SPA, we update meta tags dynamically per route.
 */
export const useSEOHead = ({
  title = "TrendVault - Viral Products & Trending Deals",
  description = "Discover curated viral products, trending deals, and exclusive flash sales. Shop TikTok-famous gadgets with fast shipping.",
  image = "/og-image.jpg",
  url,
  type = "website",
  price,
  productName,
}: SEOHeadProps = {}) => {
  const location = useLocation();
  const currentUrl = url || `https://trendvault.store${location.pathname}`;
  const fullTitle = title.includes("TrendVault") ? title : `${title} | TrendVault`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Helper to set meta tag
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Primary meta
    setMeta("name", "description", description);
    setMeta("name", "robots", "index, follow");

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image.startsWith("http") ? image : `https://trendvault.store${image}`);
    setMeta("property", "og:url", currentUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "TrendVault");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image.startsWith("http") ? image : `https://trendvault.store${image}`);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);

    // Product structured data
    if (productName && price) {
      let script = document.getElementById("product-jsonld");
      if (!script) {
        script = document.createElement("script");
        script.id = "product-jsonld";
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: productName,
        description,
        image: image.startsWith("http") ? image : `https://trendvault.store${image}`,
        offers: {
          "@type": "Offer",
          price: price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: currentUrl,
        },
      });
    }

    return () => {
      // Clean up product JSON-LD on unmount
      const script = document.getElementById("product-jsonld");
      if (script) script.remove();
    };
  }, [fullTitle, description, image, currentUrl, type, price, productName]);
};
