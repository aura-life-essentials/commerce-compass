import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Pricing from "./pages/Pricing";
import Landing from "./pages/Landing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import ViralEngine from "./pages/ViralEngine";
import ContentFactory from "./pages/ContentFactory";
import Welcome from "./pages/Welcome";
import Contact from "./pages/Contact";
import WarRoom from "./pages/WarRoom";
import BotSwarm from "./pages/BotSwarm";
import MarketingBlitz from "./pages/MarketingBlitz";
import ConnectivityDashboard from "./pages/ConnectivityDashboard";
import SystemHealth from "./pages/SystemHealth";
import MainHub from "./pages/MainHub";
import LeadVault from "./pages/LeadVault";
import NotFound from "./pages/NotFound";
import MyApps from "./pages/MyApps";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <Routes>
      {/* Public main hub */}
      <Route path="/" element={<MainHub />} />
      
      {/* Protected CEO Dashboard - requires admin access */}
      <Route 
        path="/command-center" 
        element={
          <ProtectedRoute requireAdmin>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/command-center/leads"
        element={
          <ProtectedRoute requireSuperAdmin>
            <LeadVault />
          </ProtectedRoute>
        }
      />
      
      {/* Public welcome/landing pages */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/about" element={<Landing />} />
      
      {/* Checkout */}
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      
      {/* Public pricing page */}
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
      
      {/* Subscription Management */}
      <Route path="/subscription" element={<SubscriptionManagement />} />
      
      {/* My Apps - subscriber dashboard */}
      <Route path="/my-apps" element={<MyApps />} />
      
      {/* Viral Engine */}
      <Route path="/viral-engine" element={
        <ProtectedRoute requireAdmin>
          <ViralEngine />
        </ProtectedRoute>
      } />
      
      {/* Content Factory */}
      <Route path="/content-factory" element={
        <ProtectedRoute requireAdmin>
          <ContentFactory />
        </ProtectedRoute>
      } />
      
      {/* Contact */}
      <Route path="/contact" element={<Contact />} />
      
      {/* War Room */}
      <Route path="/war-room" element={
        <ProtectedRoute requireAdmin>
          <WarRoom />
        </ProtectedRoute>
      } />
      
      {/* Bot Swarm */}
      <Route path="/bot-swarm" element={
        <ProtectedRoute requireAdmin>
          <BotSwarm />
        </ProtectedRoute>
      } />
      
      {/* Marketing Blitz */}
      <Route path="/marketing-blitz" element={
        <ProtectedRoute requireAdmin>
          <MarketingBlitz />
        </ProtectedRoute>
      } />

      {/* Connectivity Dashboard - super admin only */}
      <Route path="/connectivity" element={
        <ProtectedRoute requireSuperAdmin>
          <ConnectivityDashboard />
        </ProtectedRoute>
      } />
      
      {/* System Health - canonical architecture view */}
      <Route path="/system-health" element={
        <ProtectedRoute requireSuperAdmin>
          <SystemHealth />
        </ProtectedRoute>
      } />
      
      {/* Legal pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/refunds" element={<RefundPolicy />} />
      
      {/* Auth route */}
      <Route path="/auth" element={<Auth />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
