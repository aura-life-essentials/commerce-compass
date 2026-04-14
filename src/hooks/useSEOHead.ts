import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const useSEOHead = ({
  title = "AuraOmega - AI Revenue OS | Autonomous Sales Engine",
  description = "The autonomous AI operating system that sells, scales, and self-heals. Global sales engine powered by AI agent swarms.",
  image = "/placeholder.svg",
  url,
  type = "website",
}: SEOHeadProps = {}) => {
  const location = useLocation();
  const currentUrl = url || `https://ceo-brain-orchestra.lovable.app${location.pathname}`;
  const fullTitle = title.includes("AuraOmega") ? title : `${title} | AuraOmega`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("name", "robots", "index, follow");
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image.startsWith("http") ? image : `https://ceo-brain-orchestra.lovable.app${image}`);
    setMeta("property", "og:url", currentUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "AuraOmega");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image.startsWith("http") ? image : `https://ceo-brain-orchestra.lovable.app${image}`);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);
  }, [fullTitle, description, image, currentUrl, type]);
};
