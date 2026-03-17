import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Building2, ExternalLink, Mail, MessageSquare, Phone, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuraOmegaLogo } from "@/components/branding/AuraOmegaLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSEOHead } from "@/hooks/useSEOHead";
import { leadStatusOptions, type LeadStatus } from "@/lib/leadIntake";

type LeadContact = {
  id: string;
  created_at: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  website: string | null;
  project_type: string | null;
  budget_range: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  last_contacted_at: string | null;
};

const statusTone: Record<LeadStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  qualified: "bg-accent/60 text-accent-foreground border-accent/30",
  contacted: "bg-secondary text-secondary-foreground border-border",
  won: "bg-primary text-primary-foreground border-primary/30",
  archived: "bg-muted text-muted-foreground border-border",
};

export default function LeadVault() {
  useSEOHead({
    title: "Private Lead Vault | Aura Omega",
    description: "Private owner-only contact dashboard for reviewing captured leads and engagement details.",
  });

  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["lead-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_contacts")
        .select("id, created_at, full_name, email, phone, company_name, website, project_type, budget_range, message, source, status, last_contacted_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as LeadContact[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const payload = {
        status,
        last_contacted_at: status === "contacted" ? new Date().toISOString() : null,
      };

      const { error } = await supabase.from("lead_contacts").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-contacts"] });
      toast.success("Lead updated");
    },
    onError: () => toast.error("Could not update this lead"),
  });

  const summary = useMemo(() => {
    return {
      total: leads.length,
      fresh: leads.filter((lead) => lead.status === "new").length,
      active: leads.filter((lead) => lead.status === "qualified" || lead.status === "contacted").length,
      won: leads.filter((lead) => lead.status === "won").length,
    };
  }, [leads]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Link to="/command-center" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-opacity hover:opacity-80">
              <ArrowLeft className="h-4 w-4" /> Back to command center
            </Link>
            <AuraOmegaLogo subtitle="Private owner-only lead intelligence" className="max-w-full" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Only your super-admin account can access this page and these records.
            </div>
          </div>

          <Link to="/contact">
            <Button variant="outline">Open public contact page</Button>
          </Link>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Total leads", value: summary.total },
            { label: "New", value: summary.fresh },
            { label: "Active", value: summary.active },
            { label: "Won", value: summary.won },
          ].map((item) => (
            <Card key={item.label} className="bg-card/70">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Captured contacts</CardTitle>
            <CardDescription>Every submitted lead stays private and visible only here under your owner account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-36 animate-pulse rounded-2xl bg-muted/40" />
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
                <UserRound className="mx-auto mb-3 h-10 w-10 text-primary" />
                <p className="text-lg font-medium">No leads captured yet</p>
                <p className="mt-2 text-sm text-muted-foreground">Use the public contact page to begin collecting names, emails, and project details securely.</p>
              </div>
            ) : (
              leads.map((lead) => (
                <article key={lead.id} className="rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold">{lead.full_name}</h2>
                        <Badge className={statusTone[lead.status]}>{lead.status}</Badge>
                        <Badge variant="outline">{lead.source}</Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        {lead.email ? <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /><a className="hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a></div> : null}
                        {lead.phone ? <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a className="hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a></div> : null}
                        {lead.company_name ? <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />{lead.company_name}</div> : null}
                        {lead.website ? <div className="flex items-center gap-2"><ExternalLink className="h-4 w-4 text-primary" /><a className="hover:underline" href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer">{lead.website}</a></div> : null}
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:w-52">
                      <Select value={lead.status} onValueChange={(value: LeadStatus) => updateStatus.mutate({ id: lead.id, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadStatusOptions.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {lead.message ? (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MessageSquare className="h-4 w-4 text-primary" /> Inquiry
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{lead.message}</p>
                      </div>
                    </>
                  ) : null}
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
