import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import Store from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import ShopifyProductDetail from "./pages/ShopifyProductDetail";
import Auth from "./pages/Auth";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderHistory from "./pages/OrderHistory";
import Wishlist from "./pages/Wishlist";
import Metaverse from "./pages/Metaverse";
import Pricing from "./pages/Pricing";
import Landing from "./pages/Landing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import CasinoLaunch from "./pages/CasinoLaunch";
import IndustryRoadmaps from "./pages/IndustryRoadmaps";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return (
    <Routes>
      {/* Protected CEO Dashboard - requires admin access */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute requireAdmin>
            <Index />
          </ProtectedRoute>
        } 
      />
      
      {/* Public landing page */}
      <Route path="/welcome" element={<Landing />} />
      
      {/* Public store routes */}
      <Route path="/store" element={<Store />} />
      <Route path="/product/:handle" element={<ShopifyProductDetail />} />
      <Route path="/product-legacy/:productId" element={<ProductDetail />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />
      <Route 
        path="/metaverse" 
        element={
          <ProtectedRoute>
            <Metaverse />
          </ProtectedRoute>
        } 
      />
      
      {/* Public pricing page */}
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
      
      {/* Casino Launch page */}
      <Route path="/casino" element={<CasinoLaunch />} />
      
      {/* Industry Roadmaps page */}
      <Route path="/industry-roadmaps" element={<IndustryRoadmaps />} />
      
      {/* Subscription Management */}
      <Route path="/subscription" element={<SubscriptionManagement />} />
      
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

const App = () => (
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

export default App;
