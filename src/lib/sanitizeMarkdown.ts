/**
 * Hardened markdown → safe HTML renderer.
 * - HTML-escapes every input chunk before re-injecting tags
 * - Allows only http(s) and mailto links; blocks javascript:, data:, vbscript:
 * - Strips control chars
 * - Treats unmatched markdown as plain text
 */
const ALLOWED_PROTOCOL = /^(https?:|mailto:)/i;

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!ALLOWED_PROTOCOL.test(trimmed)) return "#";
  // Re-escape after protocol check so quotes/angles can't break out
  return escape(trimmed);
};

const stripControl = (s: string) => s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "");

export function renderSafeMarkdown(md: string): string {
  const cleaned = stripControl(md ?? "");
  const lines = cleaned.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushList();
      const lvl = Math.min(h[1].length + 1, 6);
      out.push(
        `<h${lvl} class="mt-6 mb-2 font-bold tracking-tight text-foreground">${inlineFmt(h[2])}</h${lvl}>`,
      );
      continue;
    }
    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) {
      if (!inList) {
        out.push('<ul class="list-disc pl-6 space-y-1 my-3">');
        inList = true;
      }
      out.push(`<li>${inlineFmt(li[1])}</li>`);
      continue;
    }
    flushList();
    out.push(`<p class="my-3 leading-relaxed text-muted-foreground">${inlineFmt(line)}</p>`);
  }
  flushList();
  return out.join("\n");
}

function inlineFmt(text: string): string {
  // Escape FIRST, then re-inject limited markdown. Order matters.
  const escaped = escape(text);

  // [label](url) — label/url are still escaped, but we re-validate the url
  let html = escaped.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_m, label, url) => {
      // Decode the &amp; back to & for protocol check, then sanitize
      const decoded = String(url).replace(/&amp;/g, "&");
      const href = safeUrl(decoded);
      return `<a href="${href}" class="text-primary underline underline-offset-4 hover:text-primary/80" rel="noopener noreferrer nofollow" target="_blank">${label}</a>`;
    },
  );

  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 rounded bg-muted text-foreground/90 text-sm">$1</code>',
  );
  return html;
}