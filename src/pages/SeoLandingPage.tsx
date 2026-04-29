import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSEOHead } from '@/hooks/useSEOHead';
import { AuraOmegaLogo } from '@/components/branding/AuraOmegaLogo';

interface SeoPage {
  id: string;
  slug: string;
  app_id: string;
  title: string;
  meta_description: string;
  headline: string;
  subheadline: string | null;
  body_md: string;
  cta_text: string;
  target_url: string;
  keywords: string[];
}

// Tiny, safe markdown → HTML for AI-generated H2/H3/lists/paragraphs.
function renderMarkdown(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const flushList = () => { if (inList) { out.push('</ul>'); inList = false; } };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushList(); continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushList();
      const lvl = Math.min(h[1].length + 1, 6); // shift down so page H1 stays unique
      out.push(`<h${lvl} class="mt-6 mb-2 font-bold tracking-tight text-foreground">${escape(h[2])}</h${lvl}>`);
      continue;
    }
    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) {
      if (!inList) { out.push('<ul class="list-disc pl-6 space-y-1 my-3">'); inList = true; }
      out.push(`<li>${escape(li[1])}</li>`);
      continue;
    }
    flushList();
    let html = escape(line);
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, u) =>
      `<a href="${u}" class="text-primary underline underline-offset-4 hover:text-primary/80">${t}</a>`);
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-foreground/90 text-sm">$1</code>');
    out.push(`<p class="my-3 leading-relaxed text-muted-foreground">${html}</p>`);
  }
  flushList();
  return out.join('\n');
}

export default function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<SeoPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSEOHead({
    title: page ? page.title : 'AuraOmega',
    description: page?.meta_description || 'Autonomous AI revenue agents.',
  });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('seo_landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      if (cancelled) return;
      if (!data) { setNotFound(true); setLoading(false); return; }
      setPage(data as SeoPage);
      setLoading(false);
      // Best-effort view counter (RLS allows owner; ignore failures)
      supabase.from('seo_landing_pages').update({ views: (data.views ?? 0) + 1 }).eq('id', data.id).then(() => {});
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <Link to="/"><Button variant="outline">Back home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="min-w-0"><AuraOmegaLogo className="max-w-[14rem]" /></Link>
          <a href={page.target_url} target="_blank" rel="noreferrer">
            <Button size="sm" className="bg-gradient-to-r from-primary to-cyan-500">
              {page.cta_text} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:px-6 max-w-3xl">
        <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">
          <Sparkles className="w-3 h-3 mr-1" /> AuraOmega
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{page.headline}</h1>
        {page.subheadline && (
          <p className="mt-3 text-lg text-muted-foreground">{page.subheadline}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={page.target_url} target="_blank" rel="noreferrer">
            <Button size="lg" className="bg-gradient-to-r from-primary to-cyan-500 glow-primary">
              {page.cta_text} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Secured by Stripe · 3-day free trial
          </span>
        </div>

        <article
          className="mt-10 prose-like"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body_md) }}
        />

        <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to start?</h2>
          <p className="text-muted-foreground mb-4">Cancel anytime in one click from the customer portal.</p>
          <a href={page.target_url} target="_blank" rel="noreferrer">
            <Button size="lg" className="bg-gradient-to-r from-primary to-cyan-500">
              {page.cta_text} <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
        </div>
      </main>
    </div>
  );
}