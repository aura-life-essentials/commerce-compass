import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useRealtimeAgentConversations,
  useConversationStats,
} from "@/hooks/useAgentConversations";
import { useAgentLogs } from "@/hooks/useAgentLogs";
import {
  Bot,
  MessageSquare,
  Activity,
  Zap,
  Globe,
  DollarSign,
  Users,
  TrendingUp,
  Radio,
  Send,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const agentColors: Record<string, string> = {
  "Profit Reaper": "from-red-500 to-orange-500",
  "Omega Swarm": "from-purple-500 to-pink-500",
  "Viral Hunter": "from-blue-500 to-cyan-500",
  "Content Creator": "from-green-500 to-emerald-500",
  "CEO Brain": "from-yellow-500 to-amber-500",
  "Deal Closer": "from-indigo-500 to-violet-500",
};

const sentimentIcons: Record<string, string> = {
  positive: "🟢",
  neutral: "🟡",
  negative: "🔴",
};

export function AgentMonitor() {
  const conversations = useRealtimeAgentConversations();
  const { data: stats } = useConversationStats();
  const { data: recentLogs } = useAgentLogs(undefined, 50);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-green-500 animate-pulse" />
            Real-Time Agent Monitor
          </h2>
          <p className="text-muted-foreground">
            Live view of all autonomous agent activities and conversations
          </p>
        </div>
        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          {stats?.activeConversations || 0} Active Sessions
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-3xl font-bold">{stats?.activeConversations || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Total Convos</span>
            </div>
            <p className="text-3xl font-bold">{stats?.totalConversations || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Revenue Gen.</span>
            </div>
            <p className="text-3xl font-bold">
              ${(stats?.totalRevenueGenerated || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Sentiment</span>
            </div>
            <div className="flex items-center gap-2 text-xl">
              <span>{sentimentIcons.positive} {stats?.sentimentBreakdown?.positive || 0}</span>
              <span>{sentimentIcons.neutral} {stats?.sentimentBreakdown?.neutral || 0}</span>
              <span>{sentimentIcons.negative} {stats?.sentimentBreakdown?.negative || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Live Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <AnimatePresence>
                {conversations.length > 0 ? (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conv.id
                            ? "bg-primary/20 border border-primary/50"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                        onClick={() => setSelectedConversation(conv.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                conv.is_active ? "bg-green-500 animate-pulse" : "bg-gray-500"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium bg-gradient-to-r ${
                                agentColors[conv.agent_name] || "from-gray-500 to-gray-600"
                              } bg-clip-text text-transparent`}
                            >
                              {conv.agent_name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(conv.started_at), "h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {conv.contact_name || conv.contact_email || "Unknown Contact"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {conv.platform}
                          </Badge>
                          <span className="text-xs">
                            {sentimentIcons[conv.sentiment] || "🟡"}
                          </span>
                          {conv.revenue_generated > 0 && (
                            <span className="text-xs text-green-400">
                              +${conv.revenue_generated}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No active conversations</p>
                    <p className="text-sm">Agents are scanning for opportunities...</p>
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Conversation Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversation View
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeConversation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{activeConversation.contact_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{activeConversation.contact_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Handled by</p>
                    <p
                      className={`font-medium bg-gradient-to-r ${
                        agentColors[activeConversation.agent_name] || "from-gray-500 to-gray-600"
                      } bg-clip-text text-transparent`}
                    >
                      {activeConversation.agent_name}
                    </p>
                  </div>
                </div>

                <ScrollArea className="h-[350px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {(activeConversation.messages as Array<{
                      role: "agent" | "contact";
                      content: string;
                      timestamp: string;
                    }>).map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          msg.role === "agent" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "agent"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === "agent" ? (
                              <Bot className="w-3 h-3" />
                            ) : (
                              <User className="w-3 h-3" />
                            )}
                            <span className="text-xs opacity-70">
                              {format(new Date(msg.timestamp), "h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {activeConversation.outcome && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">
                      <strong>Outcome:</strong> {activeConversation.outcome}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a conversation to view details</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Agent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {recentLogs?.slice(0, 20).map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      log.status === "completed"
                        ? "bg-green-500"
                        : log.status === "processing"
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium bg-gradient-to-r ${
                      agentColors[log.agent_name] || "from-gray-500 to-gray-600"
                    } bg-clip-text text-transparent`}
                  >
                    {log.agent_name}
                  </span>
                  <span className="text-sm text-muted-foreground flex-1">
                    {log.action}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at), "h:mm:ss a")}
                  </span>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
