import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Store from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderHistory from "./pages/OrderHistory";
import Wishlist from "./pages/Wishlist";
import Metaverse from "./pages/Metaverse";
import Pricing from "./pages/Pricing";
import Landing from "./pages/Landing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/product/:productId" element={<ProductDetail />} />
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
            
            {/* Auth route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
