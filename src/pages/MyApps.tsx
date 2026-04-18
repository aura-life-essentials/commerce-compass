import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Users, Zap, ShoppingCart, Globe, Video, 
  Lock, Crown, ArrowRight, CheckCircle, Clock,
  BarChart3, Target, MessageSquare, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/dashboard/Header';
import { CEODashboard } from '@/components/dashboard/CEODashboard';
import { ProfitReaper } from '@/components/dashboard/ProfitReaper';
import { AgentMonitor } from '@/components/dashboard/AgentMonitor';
import { RealMetrics } from '@/components/dashboard/RealMetrics';
import { CRMDashboard } from '@/components/dashboard/CRMDashboard';
import { AutonomousSalesPanel } from '@/components/dashboard/AutonomousSalesPanel';
import { RevenueLoopEngine } from '@/components/dashboard/RevenueLoopEngine';
import { MarketingEngine } from '@/components/dashboard/MarketingEngine';

// Define which tools are available per tier
const CORE_TOOLS = [
  { id: 'lead-qualifier', name: 'Lead Qualifier Agent', icon: Target, description: 'Scores and qualifies inbound leads automatically' },
  { id: 'nurture-agent', name: 'Nurture Agent', icon: Mail, description: 'Automated personalized follow-up sequences' },
  { id: 'analytics', name: 'Revenue Analytics', icon: BarChart3, description: 'Basic revenue analytics dashboard' },
];

const PRO_TOOLS = [
  ...CORE_TOOLS,
  { id: 'closer-agent', name: 'Closer Agent', icon: Zap, description: 'AI-powered deal closing automation' },
  { id: 'onboarding-agent', name: 'Onboarding Agent', icon: Users, description: 'Automated customer onboarding flows' },
  { id: 'orchestrator', name: 'Agent Orchestrator', icon: Brain, description: 'Multi-agent coordination and workflow engine' },
  { id: 'ceo-brain', name: 'CEO Brain', icon: Brain, description: 'Strategic AI decision engine' },
  { id: 'profit-reaper', name: 'Profit Reaper', icon: Crown, description: 'Revenue optimization and profit tracking' },
  { id: 'crm', name: 'Full CRM Dashboard', icon: MessageSquare, description: 'Contact management and deal pipeline' },
  { id: 'marketing', name: 'Marketing Engine', icon: Globe, description: 'Campaign automation and content distribution' },
];

export default function MyApps() {
  const { user } = useAuthContext();
  const { isSubscribed, tier, trialActive, trialDaysRemaining, isLoading } = useSubscription();
  const navigate = useNavigate();
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const tools = tier === 'pro' || tier === 'enterprise' ? PRO_TOOLS : CORE_TOOLS;

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <Lock className="w-16 h-16 text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-3">Sign in to access your apps</h1>
          <p className="text-muted-foreground mb-6">Subscribe to a plan and your AI tools will appear here.</p>
          <Button onClick={() => navigate('/auth')} size="lg">Sign In</Button>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-8 w-40 rounded bg-primary/10 animate-pulse" />
              <div className="h-4 w-64 rounded bg-primary/10 animate-pulse" />
            </div>
            <div className="h-9 w-32 rounded bg-primary/10 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="oro-card p-5 h-28 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/15" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-primary/15" />
                    <div className="h-3 w-44 rounded bg-primary/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not subscribed
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <Crown className="w-16 h-16 text-primary mb-6" />
          <h1 className="text-3xl font-bold mb-3">Unlock your AI tools</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Choose a plan to activate your autonomous revenue agents. 3-day free trial, cancel anytime.
          </p>
          <Button onClick={() => navigate('/pricing')} size="lg" className="bg-gradient-to-r from-primary to-cyan-500">
            View Plans <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Render active app tool
  const renderActiveTool = () => {
    switch (activeApp) {
      case 'ceo-brain':
        return <CEODashboard />;
      case 'profit-reaper':
        return <ProfitReaper />;
      case 'orchestrator':
        return <AgentMonitor />;
      case 'analytics':
        return <RealMetrics />;
      case 'crm':
        return <CRMDashboard />;
      case 'marketing':
        return <MarketingEngine />;
      case 'lead-qualifier':
        return <LeadQualifierTool />;
      case 'nurture-agent':
        return <NurtureAgentTool />;
      case 'closer-agent':
        return <CloserAgentTool />;
      case 'onboarding-agent':
        return <OnboardingAgentTool />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-6 py-8">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Apps</h1>
            <p className="text-muted-foreground">Your active AI tools and agents</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              {tier?.toUpperCase()} Plan Active
            </Badge>
            {trialActive && trialDaysRemaining !== null && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                <Clock className="w-3 h-3 mr-1" />
                {trialDaysRemaining} trial day{trialDaysRemaining !== 1 ? 's' : ''} left
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/subscription')}>
              Manage Plan
            </Button>
          </div>
        </div>

        {activeApp ? (
          <div>
            <Button variant="ghost" className="mb-4" onClick={() => setActiveApp(null)}>
              ← Back to My Apps
            </Button>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {renderActiveTool()}
            </motion.div>
          </div>
        ) : (
          <>
            {/* Revenue Loop Overview */}
            <div className="mb-8">
              <RevenueLoopEngine />
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 group"
                      onClick={() => setActiveApp(tool.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{tool.name}</CardTitle>
                            <CardDescription className="text-xs">{tool.description}</CardDescription>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Upgrade CTA for Core users */}
            {tier === 'core' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 p-6 rounded-xl border border-primary/20 bg-primary/5 text-center"
              >
                <h3 className="text-xl font-bold mb-2">Unlock all 10 tools with Pro</h3>
                <p className="text-muted-foreground mb-4">Get CEO Brain, Profit Reaper, Closer Agent, full CRM, and more.</p>
                <Button onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-primary to-cyan-500">
                  Upgrade to Pro — $297/mo
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Individual tool components for Core tier agents
function LeadQualifierTool() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="active">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" /> Lead Qualifier Agent
            </h2>
            <p className="text-muted-foreground">Automatically scores and qualifies your inbound leads</p>
          </div>
          <TabsList>
            <TabsTrigger value="active">Active Leads</TabsTrigger>
            <TabsTrigger value="scored">Scored</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="active">
          <AgentToolPanel 
            agentName="Lead Qualifier"
            agentRole="qualifier"
            description="This agent monitors incoming leads, scores them based on engagement signals, and routes hot leads to the Closer or Nurture agents."
          />
        </TabsContent>
        <TabsContent value="scored">
          <LeadScoringView />
        </TabsContent>
        <TabsContent value="settings">
          <p className="text-muted-foreground">Configure scoring criteria, thresholds, and routing rules.</p>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function NurtureAgentTool() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" /> Nurture Agent
        </h2>
        <p className="text-muted-foreground">Automated personalized follow-up sequences</p>
      </div>
      <AgentToolPanel 
        agentName="Nurture Sequence"
        agentRole="nurture"
        description="Sends personalized follow-ups based on lead behavior. Adapts messaging based on engagement patterns to move leads through the funnel."
      />
    </Card>
  );
}

function CloserAgentTool() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" /> Closer Agent
        </h2>
        <p className="text-muted-foreground">AI-powered deal closing automation</p>
      </div>
      <AgentToolPanel 
        agentName="Deal Closer"
        agentRole="closer"
        description="Handles final-stage negotiations, generates proposals, schedules calls, and drives deals to close with AI-optimized timing and messaging."
      />
    </Card>
  );
}

function OnboardingAgentTool() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Onboarding Agent
        </h2>
        <p className="text-muted-foreground">Automated customer onboarding flows</p>
      </div>
      <AgentToolPanel 
        agentName="Onboarding"
        agentRole="onboarding"
        description="Guides new customers through setup, configures their workspace, and ensures smooth activation to maximize retention and time-to-value."
      />
    </Card>
  );
}

// Shared agent tool panel that shows real agent logs
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

function AgentToolPanel({ agentName, agentRole, description }: { agentName: string; agentRole: string; description: string }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['agent-logs', agentRole],
    queryFn: async () => {
      const { data } = await supabase
        .from('agent_logs')
        .select('*')
        .ilike('agent_role', `%${agentRole}%`)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 15000,
  });

  const { data: conversations } = useQuery({
    queryKey: ['agent-conversations', agentRole],
    queryFn: async () => {
      const { data } = await supabase
        .from('agent_conversations')
        .select('*')
        .ilike('agent_role', `%${agentRole}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{description}</p>
      
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-card/50">
          <p className="text-xs text-muted-foreground">Actions Taken</p>
          <p className="text-2xl font-bold">{logs?.length || 0}</p>
        </Card>
        <Card className="p-4 bg-card/50">
          <p className="text-xs text-muted-foreground">Conversations</p>
          <p className="text-2xl font-bold">{conversations?.length || 0}</p>
        </Card>
        <Card className="p-4 bg-card/50">
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-400">Active</span>
          </div>
        </Card>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Recent Activity</h4>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-muted/30">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{log.action}</span>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    {log.status && ` • ${log.status}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Agent is active and monitoring. Activity will appear here as leads come in.
          </p>
        )}
      </div>
    </div>
  );
}

function LeadScoringView() {
  const { data: leads, isLoading } = useQuery({
    queryKey: ['scored-leads'],
    queryFn: async () => {
      const { data } = await supabase
        .from('lead_contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <p className="text-muted-foreground">Loading leads...</p>;

  return (
    <div className="space-y-2">
      {leads && leads.length > 0 ? (
        leads.map((lead: any) => (
          <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">{lead.full_name}</p>
              <p className="text-xs text-muted-foreground">{lead.email} • {lead.source}</p>
            </div>
            <Badge variant={lead.status === 'qualified' ? 'default' : 'secondary'}>
              {lead.status}
            </Badge>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground italic">No leads scored yet. Leads will appear as they come in.</p>
      )}
    </div>
  );
}
