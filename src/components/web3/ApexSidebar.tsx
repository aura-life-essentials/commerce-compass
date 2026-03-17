import {
  Activity,
  Blocks,
  Bot,
  Compass,
  Globe,
  Layers3,
  Radar,
  Rocket,
  Search,
  Shield,
  Sparkles,
  TowerControl,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { AuraOmegaLogo } from "@/components/branding/AuraOmegaLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const coreItems = [
  { title: "Apex Search", url: "/industry-roadmaps", icon: Search },
  { title: "Command Center", url: "/command-center", icon: TowerControl },
  { title: "War Room", url: "/war-room", icon: Shield },
  { title: "Bot Swarm", url: "/bot-swarm", icon: Bot },
];

const ecosystemItems = [
  { title: "Storefront", url: "/store", icon: Compass },
  { title: "Marketing Blitz", url: "/marketing-blitz", icon: Rocket },
  { title: "Viral Engine", url: "/viral-engine", icon: Sparkles },
  { title: "Web3 Launch", url: "/web3-launch", icon: Blocks },
  { title: "Metaverse", url: "/metaverse", icon: Globe },
  { title: "Monetizer", url: "/app-monetizer", icon: Layers3 },
];

export function ApexSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="floating" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border/60 p-4">
        <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/70 p-3 shadow-sm">
          <AuraOmegaLogo
            variant={collapsed ? "compact" : "default"}
            subtitle={collapsed ? undefined : "Universal Web3 interface"}
            priority="muted"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-2 pt-3">
        <SidebarGroup>
          <SidebarGroupLabel>Core surface</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {coreItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title} size="lg">
                      <NavLink to={item.url} className="gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ecosystem rails</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ecosystemItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <NavLink to={item.url} className="gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pt-2">
        <div className="apex-panel space-y-3 rounded-2xl p-3">
          <div className="flex items-center justify-between gap-3">
            {!collapsed && <span className="text-xs font-medium text-sidebar-foreground/70">Live edge</span>}
            <Badge variant="secondary" className="border-0 bg-primary/15 text-primary">Active</Badge>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/80">
              <Radar className="h-3.5 w-3.5 text-primary" />
              {!collapsed && <span>Competitor radar armed</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/80">
              <Activity className="h-3.5 w-3.5 text-primary" />
              {!collapsed && <span>Search + social + launch flows</span>}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
