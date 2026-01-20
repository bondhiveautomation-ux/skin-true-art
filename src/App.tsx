import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PresenceProvider } from "@/components/PresenceProvider";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import CaptionStudio from "./pages/CaptionStudio";
import PhotographyStudio from "./pages/PhotographyStudio";
import BrandingStudio from "./pages/BrandingStudio";
import Pricing from "./pages/Pricing";
import Info from "./pages/Info";
import NotFound from "./pages/NotFound";

// Tool pages
import CharacterGeneratorPage from "./pages/tools/CharacterGeneratorPage";
import PromptExtractorPage from "./pages/tools/PromptExtractorPage";
import DressExtractorPage from "./pages/tools/DressExtractorPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PresenceProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/info" element={<Info />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/caption-studio" element={<ProtectedRoute><CaptionStudio /></ProtectedRoute>} />
            <Route path="/photography-studio" element={<ProtectedRoute><PhotographyStudio /></ProtectedRoute>} />
            <Route path="/branding-studio" element={<ProtectedRoute><BrandingStudio /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            
            {/* Tool pages */}
            <Route path="/tools/character-generator" element={<ProtectedRoute><CharacterGeneratorPage /></ProtectedRoute>} />
            <Route path="/tools/prompt-extractor" element={<ProtectedRoute><PromptExtractorPage /></ProtectedRoute>} />
            <Route path="/tools/dress-extractor" element={<ProtectedRoute><DressExtractorPage /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PresenceProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
