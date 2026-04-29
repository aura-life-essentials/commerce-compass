import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Copy, ExternalLink, Rocket, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSEOHead } from '@/hooks/useSEOHead';
import { LaunchStatusTracker, type LaunchStatus } from '@/components/launch/LaunchStatusTracker';
import { AiActionAuditLog } from '@/components/launch/AiActionAuditLog';

interface SocialPost {
  id: string;
  platform: string;
  title: string | null;
  body: string;
  hashtags: string[];
  cta: string | null;
  target_url: string;
}
interface SeoPage {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
}
interface LaunchRow {
  id: string;
  app_id: string;
  app_name: string;
  status: string;
  posts_generated: number;
  landing_pages_generated: number;
  stripe_checkout_url: string | null;
}

export default function LaunchDashboard() {
  const { id } = useParams<{ id: string }>();
  const { session, user } = useAuthContext();
  const navigate = useNavigate();
  const [launch, setLaunch] = useState<LaunchRow | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);

  useSEOHead({
    title: launch ? `Launch: ${launch.app_name} — AuraOmega` : 'Launch — AuraOmega',
    description: 'One-click organic launch dashboard.',
  });

  useEffect(() => {
    if (!id || !user) return;
    let cancelled = false;
    const load = async () => {
      const [{ data: l }, { data: p }, { data: s }] = await Promise.all([
        supabase.from('organic_launches').select('*').eq('id', id).maybeSingle(),
        supabase.from('social_posts').select('*').eq('launch_id', id).order('platform'),
        supabase.from('seo_landing_pages').select('id,slug,title,meta_description').eq('launch_id', id),
      ]);
      if (cancelled) return;
      setLaunch(l as LaunchRow | null);
      setPosts((p as SocialPost[]) || []);
      setPages((s as SeoPage[]) || []);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 4000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [id, user, session?.access_token]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="space-y-3">
          <p>Please sign in to view your launch.</p>
          <Button onClick={() => navigate('/auth')}>Sign in</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Launch not found.</p>
      </div>
    );
  }

  const copy = (text: string, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const isGenerating = launch.status === 'generating' || launch.status === 'pending';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <div className="mb-8 space-y-2">
          <Badge className="bg-primary/10 border-primary/30 text-primary">
            <Rocket className="w-3 h-3 mr-1" /> Organic Launch
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">{launch.app_name}</h1>
          {launch.stripe_checkout_url && (
            <div className="flex items-center gap-2">
              <Button
                size="sm" variant="outline"
                onClick={() => copy(launch.stripe_checkout_url!, 'Checkout link copied')}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy checkout link
              </Button>
              <a href={launch.stripe_checkout_url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="ghost">
                  Open <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </a>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="oro-card border-border/40">
            <CardHeader className="pb-2"><CardTitle className="text-base">Launch status</CardTitle></CardHeader>
            <CardContent>
              <LaunchStatusTracker
                status={launch.status as LaunchStatus}
                postsGenerated={launch.posts_generated}
                pagesGenerated={launch.landing_pages_generated}
              />
            </CardContent>
          </Card>
          <AiActionAuditLog limit={20} />
        </div>

        <h2 className="text-xl font-semibold mb-3">Social posts ({posts.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          {posts.map((p) => (
            <Card key={p.id} className="oro-card border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base capitalize flex items-center justify-between">
                  {p.platform}
                  <Button size="sm" variant="ghost" onClick={() => copy(`${p.title ? p.title + '\n\n' : ''}${p.body}\n\n${p.hashtags.map((h) => '#' + h).join(' ')}\n\n${p.target_url}`)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {p.title && <div className="font-medium">{p.title}</div>}
                <p className="whitespace-pre-wrap text-muted-foreground line-clamp-6">{p.body}</p>
                {p.hashtags.length > 0 && (
                  <div className="text-xs text-primary/80">{p.hashtags.map((h) => '#' + h).join(' ')}</div>
                )}
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && !isGenerating && (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-3">SEO landing pages ({pages.length})</h2>
        <div className="grid gap-3">
          {pages.map((p) => (
            <Card key={p.id} className="oro-card border-border/40">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.meta_description}</div>
                </div>
                <Link to={`/l/${p.slug}`}>
                  <Button size="sm" variant="outline">
                    View <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}