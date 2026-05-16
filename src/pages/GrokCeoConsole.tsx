import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mic, MicOff, Send, ShieldCheck, Volume2, VolumeX, Radio, Lock, Loader2 } from "lucide-react";

const OWNER_EMAILS = ["ryanauralift@gmail.com", "thegrokfather@outlook.com"];

interface GrokResp {
  spoken_reply?: string;
  intent?: string;
  summary?: string;
  actions?: Array<{ action: string; params?: Record<string, unknown>; why?: string }>;
  routing_suggestions?: Array<{ product: string; store: string; reasoning: string; confidence: number }>;
  next_steps?: string[];
  confidence?: number;
  _provider?: string;
  _model?: string;
}

interface AuditRow {
  id: string;
  command: string;
  input_mode: string;
  status: string;
  grok_response: GrokResp | null;
  routing_decision: unknown;
  created_at: string;
  error?: string | null;
}

interface RoutingRow {
  id: string;
  product_title: string | null;
  recommended_store_name: string | null;
  reasoning: string | null;
  confidence: number;
  status: string;
  created_at: string;
}

export default function GrokCeoConsole() {
  const { user, isSuperAdmin, isLoading } = useAuthContext();
  const email = (user?.email ?? "").toLowerCase();
  const isOwner = OWNER_EMAILS.includes(email) && isSuperAdmin;

  const [command, setCommand] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceOut, setVoiceOut] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [listening, setListening] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: "you" | "grok"; text: string; meta?: GrokResp }>>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [routing, setRouting] = useState<RoutingRow[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const recogRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load audit + routing when owner
  const loadAudit = useCallback(async () => {
    if (!isOwner) return;
    setLoadingAudit(true);
    const [{ data: a }, { data: r }] = await Promise.all([
      supabase.from("grok_ceo_audit").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("multi_store_routing").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setAudit((a ?? []) as any);
    setRouting((r ?? []) as any);
    setLoadingAudit(false);
  }, [isOwner]);

  useEffect(() => { loadAudit(); }, [loadAudit]);

  // Realtime audit stream (owner-only RLS enforces it)
  useEffect(() => {
    if (!isOwner) return;
    const ch = supabase.channel("grok-ceo-audit")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "grok_ceo_audit" },
        (p) => setAudit((cur) => [p.new as AuditRow, ...cur].slice(0, 100)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isOwner]);

  // Voice in (Web Speech API)
  const startListening = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser"); return; }
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";
    recog.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setCommand(text);
      setListening(false);
      void sendCommand(text, "voice");
    };
    recog.onerror = () => { setListening(false); toast.error("Voice recognition error"); };
    recog.onend = () => setListening(false);
    recogRef.current = recog;
    recog.start();
    setListening(true);
  };
  const stopListening = () => { recogRef.current?.stop(); setListening(false); };

  // Voice out
  const speak = (text: string) => {
    if (!voiceOut || !text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05; u.pitch = 1; u.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch { /* noop */ }
  };

  const sendCommand = async (cmd: string, mode: "text" | "voice" = "text") => {
    if (!cmd.trim()) return;
    setThinking(true);
    setConversation((c) => [...c, { role: "you", text: cmd }]);
    setCommand("");
    try {
      const { data, error } = await supabase.functions.invoke("grok-ceo-console", {
        body: { command: cmd, input_mode: mode, dispatch: autoDispatch },
      });
      if (error) throw error;
      const grok: GrokResp = data?.grok ?? {};
      const reply = grok.spoken_reply || grok.summary || "Acknowledged.";
      setConversation((c) => [...c, { role: "grok", text: reply, meta: grok }]);
      speak(reply);
      if (data?.dispatched) toast.success("Command dispatched");
      // Optimistic refresh of audit
      void loadAudit();
    } catch (e: any) {
      toast.error(e?.message ?? "Grok failed");
      setConversation((c) => [...c, { role: "grok", text: `Error: ${e?.message ?? "unknown"}` }]);
    } finally {
      setThinking(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }));
    }
  };

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground"><Loader2 className="animate-spin" /></div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="p-8 max-w-md text-center oro-card">
          <Lock className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Owner sign-in required</h1>
          <p className="text-muted-foreground mb-4">The Grok CEO Console is locked to the owner accounts.</p>
          <Button asChild><a href="/auth">Sign in</a></Button>
        </Card>
      </div>
    );
  }
  if (!isOwner) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="p-8 max-w-md text-center oro-card">
          <Lock className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Forbidden</h1>
          <p className="text-muted-foreground">This console is for Ryan Puddy only.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            <Radio className="text-primary" /> Grok CEO Console
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Owner-only · {email} · super_admin verified
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><Switch checked={voiceOut} onCheckedChange={setVoiceOut} id="vout" /><Label htmlFor="vout" className="flex items-center gap-1">{voiceOut ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>} Speak</Label></div>
          <div className="flex items-center gap-2"><Switch checked={autoDispatch} onCheckedChange={setAutoDispatch} id="disp" /><Label htmlFor="disp">Auto-dispatch</Label></div>
        </div>
      </header>

      <Tabs defaultValue="console" className="space-y-4">
        <TabsList>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="audit">Audit Log ({audit.length})</TabsTrigger>
          <TabsTrigger value="routing">Routing ({routing.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="space-y-4">
          <Card className="oro-card p-4">
            <ScrollArea className="h-[50vh] mb-3" ref={scrollRef as any}>
              <div className="space-y-3">
                {conversation.length === 0 && (
                  <p className="text-muted-foreground text-sm">Say or type a command. Try "status", "what should I launch tonight", or "route the neck fan".</p>
                )}
                {conversation.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "you" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 ${m.role === "you" ? "bg-primary/15 border border-primary/30" : "bg-card border"}`}>
                      <div className="text-xs uppercase opacity-60 mb-1">{m.role === "you" ? "You" : "Grok"}</div>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      {m.meta && (
                        <details className="mt-2 text-xs opacity-80">
                          <summary className="cursor-pointer">JSON · {m.meta._provider ?? "?"} · confidence {Math.round((m.meta.confidence ?? 0) * 100)}%</summary>
                          <pre className="mt-1 overflow-auto bg-background/40 p-2 rounded text-[10px]">{JSON.stringify(m.meta, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
                {thinking && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Grok is thinking...</div>}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendCommand(command); } }}
                placeholder="Speak or type your command to Grok..."
                className="min-h-[60px]"
              />
              <div className="flex flex-col gap-2">
                <Button onClick={listening ? stopListening : startListening} variant={listening ? "destructive" : "secondary"} size="icon">
                  {listening ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={() => void sendCommand(command)} disabled={thinking || !command.trim()} size="icon">
                  <Send />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="oro-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-primary"/> Encrypted Audit Trail — Owner Eyes Only</h2>
              <Button size="sm" variant="ghost" onClick={loadAudit} disabled={loadingAudit}>{loadingAudit ? "Loading..." : "Refresh"}</Button>
            </div>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {audit.length === 0 && <p className="text-sm text-muted-foreground">No commands yet.</p>}
                {audit.map((a) => (
                  <details key={a.id} className="border rounded p-3 bg-card/40">
                    <summary className="cursor-pointer flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs">{new Date(a.created_at).toLocaleString()}</span>
                      <Badge variant={a.status === "ok" ? "default" : "destructive"}>{a.status}</Badge>
                      <Badge variant="outline">{a.input_mode}</Badge>
                      <span className="truncate flex-1 text-sm">{a.command}</span>
                    </summary>
                    <pre className="mt-2 text-[10px] overflow-auto bg-background/40 p-2 rounded">{JSON.stringify({ grok_response: a.grok_response, routing: a.routing_decision, error: a.error }, null, 2)}</pre>
                  </details>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="routing">
          <Card className="oro-card p-4">
            <h2 className="font-semibold mb-3">Multi-Store Routing Suggestions</h2>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {routing.length === 0 && <p className="text-sm text-muted-foreground">No routing suggestions queued. Ask Grok "route my top product" to generate.</p>}
                {routing.map((r) => (
                  <div key={r.id} className="border rounded p-3 bg-card/40">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-semibold">{r.product_title ?? "—"} → {r.recommended_store_name ?? "—"}</div>
                      <Badge>{r.status}</Badge>
                    </div>
                    {r.reasoning && <p className="text-sm text-muted-foreground mt-1">{r.reasoning}</p>}
                    <div className="text-xs opacity-60 mt-1">confidence {Math.round((r.confidence ?? 0) * 100)}% · {new Date(r.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}