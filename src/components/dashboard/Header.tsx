import { Bell, Settings, Command, LogOut, Shield, Crown, CreditCard, Globe, Sparkles, Bot, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AuraOmegaLogo } from "@/components/branding/AuraOmegaLogo";

export const Header = () => {
  const { user, role, isSuperAdmin, signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return "??";
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return (
        <div className="flex items-center gap-1 text-xs text-amber-400">
          <Crown className="w-3 h-3" />
          <span>Super Admin</span>
        </div>
      );
    }
    if (role === 'admin') {
      return (
        <div className="flex items-center gap-1 text-xs text-purple-400">
          <Shield className="w-3 h-3" />
          <span>Admin</span>
        </div>
      );
    }
    return null;
  };

  return (
    <header className="glass-subtle sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AuraOmegaLogo subtitle="Revenue Command Center" />
            <div className="status-active status-dot hidden sm:block" />
          </div>

          <div className="flex items-center gap-2">
            <Link to="/war-room">
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <Shield className="w-4 h-4 mr-2" />
                War Room
              </Button>
            </Link>
            <Link to="/bot-swarm">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
                <Bot className="w-4 h-4 mr-2" />
                Bot Swarm
              </Button>
            </Link>
            <Link to="/casino">
              <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
                <Sparkles className="w-4 h-4 mr-2" />
                Casino Launch
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <CreditCard className="w-4 h-4 mr-2" />
                Pricing
              </Button>
            </Link>
            <Link to="/app-monetizer">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Layers3 className="w-4 h-4 mr-2" />
                Monetizer
              </Button>
            </Link>
            <Link to="/metaverse">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Globe className="w-4 h-4 mr-2" />
                Metaverse
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Command className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-medium">
                      {getInitials(user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  {isSuperAdmin && (
                    <Crown className="absolute -top-1 -right-1 w-4 h-4 text-amber-400" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-slate-900 border-slate-800" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email}
                    </p>
                    {getRoleBadge()}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-red-400 focus:text-red-400 focus:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
