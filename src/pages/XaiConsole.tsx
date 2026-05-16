import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Image as ImgIcon, Video, Mic, Database, Layers, Bot, Cloud } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

type Json = any;

function useGateway(fn: string) {
  const { session } = useAuthContext();
  return async (body: Json) => {
    if (!session?.access_token) throw new Error('not signed in');
    const { data, error } = await supabase.functions.invoke(fn, {
      body,
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) throw error;
    return data;
  };
}

function JsonView({ data }: { data: any }) {
  return (
    <pre className="text-xs bg-muted/30 border border-border/40 rounded-lg p-3 overflow-auto max-h-96 whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function XaiConsole() {
  const xai = useGateway('xai-gateway');
  const gcp = useGateway('gcp-gateway');

  const [models, setModels] = useState<any>(null);
  const [files, setFiles] = useState<any>(null);
  const [batches, setBatches] = useState<any>(null);
  const [voices, setVoices] = useState<any>(null);
  const [gcpCaps, setGcpCaps] = useState<any>(null);

  const [chatModel, setChatModel] = useState('grok-4-1-fast-reasoning');
  const [chatPrompt, setChatPrompt] = useState('Status check: confirm gateway is live and list current models.');
  const [chatOut, setChatOut] = useState<any>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const [imgPrompt, setImgPrompt] = useState('AuraOmega holographic logo, deep blue-purple, glassmorphism');
  const [imgOut, setImgOut] = useState<any>(null);
  const [imgLoading, setImgLoading] = useState(false);

  const [gcpCap, setGcpCap] = useState('gemini.models');
  const [gcpParams, setGcpParams] = useState('{}');
  const [gcpOut, setGcpOut] = useState<any>(null);
  const [gcpLoading, setGcpLoading] = useState(false);

  useEffect(() => {
    xai({ route: 'models', action: 'list' }).then(setModels).catch((e) => setModels({ error: String(e) }));
    xai({ route: 'voice', action: 'voices' }).then(setVoices).catch(() => {});
    xai({ route: 'files', action: 'list' }).then(setFiles).catch(() => {});
    xai({ route: 'batches', action: 'list' }).then(setBatches).catch(() => {});
    gcp({ capability: 'list' }).then(setGcpCaps).catch((e) => setGcpCaps({ error: String(e) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runChat = async () => {
    setChatLoading(true); setChatOut(null);
    try {
      const r = await xai({
        route: 'chat',
        model: chatModel,
        messages: [{ role: 'user', content: chatPrompt }],
      });
      setChatOut(r);
    } catch (e) { setChatOut({ error: String(e) }); }
    finally { setChatLoading(false); }
  };

  const runImg = async () => {
    setImgLoading(true); setImgOut(null);
    try {
      const r = await xai({ route: 'images', action: 'generate', prompt: imgPrompt });
      setImgOut(r);
    } catch (e) { setImgOut({ error: String(e) }); }
    finally { setImgLoading(false); }
  };

  const runGcp = async () => {
    setGcpLoading(true); setGcpOut(null);
    try {
      let params = {}; try { params = JSON.parse(gcpParams); } catch {}
      const r = await gcp({ capability: gcpCap, params, body: params });
      setGcpOut(r);
    } catch (e) { setGcpOut({ error: String(e) }); }
    finally { setGcpLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/command-center" className="hover:text-foreground">Command Center</Link> / <span>X-AI Console</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              X-AI Control Plane
              <Badge className="ml-3 align-middle bg-primary/15 text-primary border-primary/30">owner only</Badge>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Canonical xAI endpoint: <code className="text-primary">supabase.functions.invoke('xai-gateway')</code> · GCP: <code className="text-primary">gcp-gateway</code>
            </p>
          </div>
          <Link to="/grok-ceo"><Button variant="outline">Open CEO Console</Button></Link>
        </header>

        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="chat"><Bot className="w-4 h-4 mr-1.5" />Chat</TabsTrigger>
            <TabsTrigger value="image"><ImgIcon className="w-4 h-4 mr-1.5" />Image</TabsTrigger>
            <TabsTrigger value="voice"><Mic className="w-4 h-4 mr-1.5" />Voice</TabsTrigger>
            <TabsTrigger value="models"><Layers className="w-4 h-4 mr-1.5" />Models</TabsTrigger>
            <TabsTrigger value="files"><Database className="w-4 h-4 mr-1.5" />Files</TabsTrigger>
            <TabsTrigger value="batches"><Video className="w-4 h-4 mr-1.5" />Batches</TabsTrigger>
            <TabsTrigger value="gcp"><Cloud className="w-4 h-4 mr-1.5" />Google Cloud</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card><CardHeader>
              <CardTitle>Grok Chat Test</CardTitle>
              <CardDescription>Direct call into the canonical xai-gateway chat route.</CardDescription>
            </CardHeader><CardContent className="space-y-3">
              <Input value={chatModel} onChange={(e) => setChatModel(e.target.value)} placeholder="model" />
              <Textarea value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} rows={4} />
              <Button onClick={runChat} disabled={chatLoading} className="bg-gradient-to-r from-primary to-cyan-500">
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send
              </Button>
              {chatOut && <JsonView data={chatOut} />}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="image">
            <Card><CardHeader><CardTitle>Image Generation</CardTitle></CardHeader><CardContent className="space-y-3">
              <Textarea value={imgPrompt} onChange={(e) => setImgPrompt(e.target.value)} rows={3} />
              <Button onClick={runImg} disabled={imgLoading} className="bg-gradient-to-r from-primary to-cyan-500">
                {imgLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImgIcon className="w-4 h-4 mr-2" />}
                Generate
              </Button>
              {imgOut?.images?.[0]?.url && (
                <img src={imgOut.images[0].url} alt="generated" className="rounded-lg border border-border/40 max-h-96" />
              )}
              {imgOut && <JsonView data={imgOut} />}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="voice">
            <Card><CardHeader><CardTitle>Available Voices</CardTitle></CardHeader><CardContent>
              <JsonView data={voices ?? { loading: true }} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="models">
            <Card><CardHeader><CardTitle>xAI Models</CardTitle></CardHeader><CardContent>
              <JsonView data={models ?? { loading: true }} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="files">
            <Card><CardHeader><CardTitle>Files</CardTitle></CardHeader><CardContent>
              <JsonView data={files ?? { loading: true }} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="batches">
            <Card><CardHeader><CardTitle>Batches</CardTitle></CardHeader><CardContent>
              <JsonView data={batches ?? { loading: true }} />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="gcp">
            <Card><CardHeader>
              <CardTitle>Google Cloud Gateway</CardTitle>
              <CardDescription>
                Uses GOOGLE_DEVELOPER_API_KEY. Limited to key-auth APIs (Gemini, YouTube Data, Translate, Maps, Custom Search).
                Logging / IAM / Storage / TTS need a service-account JSON.
              </CardDescription>
            </CardHeader><CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Available capabilities</div>
                <JsonView data={gcpCaps ?? { loading: true }} />
              </div>
              <Input value={gcpCap} onChange={(e) => setGcpCap(e.target.value)} placeholder="capability (e.g. gemini.models, youtube.search)" />
              <Textarea value={gcpParams} onChange={(e) => setGcpParams(e.target.value)} rows={4} placeholder='params JSON, e.g. {"q":"grok 4.20"}' />
              <Button onClick={runGcp} disabled={gcpLoading} className="bg-gradient-to-r from-primary to-cyan-500">
                {gcpLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Cloud className="w-4 h-4 mr-2" />}
                Run
              </Button>
              {gcpOut && <JsonView data={gcpOut} />}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}