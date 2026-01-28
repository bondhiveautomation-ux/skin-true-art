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
import Pricing from "./pages/Pricing";
import Info from "./pages/Info";
import NotFound from "./pages/NotFound";

// Tool pages
import CharacterGeneratorPage from "./pages/tools/CharacterGeneratorPage";
import PromptExtractorPage from "./pages/tools/PromptExtractorPage";
import DressExtractorPage from "./pages/tools/DressExtractorPage";
import BackgroundSaverPage from "./pages/tools/BackgroundSaverPage";
import PoseTransferPage from "./pages/tools/PoseTransferPage";
import MakeupStudioPage from "./pages/tools/MakeupStudioPage";
import FaceSwapPage from "./pages/tools/FaceSwapPage";
import CinematicStudioPage from "./pages/tools/CinematicStudioPage";
import BackgroundCreatorPage from "./pages/tools/BackgroundCreatorPage";
import PhotographyStudioPage from "./pages/tools/PhotographyStudioPage";
import CaptionStudioPage from "./pages/tools/CaptionStudioPage";
import BrandingStudioPage from "./pages/tools/BrandingStudioPage";
import PromptEngineerPage from "./pages/tools/PromptEngineerPage";
import VideographyStudioPage from "./pages/tools/VideographyStudioPage";
import LogoGeneratorPage from "./pages/tools/LogoGeneratorPage";

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
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            
            {/* Tool pages - all unified under /tools/ */}
            <Route path="/tools/character-generator" element={<ProtectedRoute><CharacterGeneratorPage /></ProtectedRoute>} />
            <Route path="/tools/prompt-extractor" element={<ProtectedRoute><PromptExtractorPage /></ProtectedRoute>} />
            <Route path="/tools/dress-extractor" element={<ProtectedRoute><DressExtractorPage /></ProtectedRoute>} />
            <Route path="/tools/background-saver" element={<ProtectedRoute><BackgroundSaverPage /></ProtectedRoute>} />
            <Route path="/tools/pose-transfer" element={<ProtectedRoute><PoseTransferPage /></ProtectedRoute>} />
            <Route path="/tools/makeup-studio" element={<ProtectedRoute><MakeupStudioPage /></ProtectedRoute>} />
            <Route path="/tools/face-swap" element={<ProtectedRoute><FaceSwapPage /></ProtectedRoute>} />
            <Route path="/tools/cinematic-studio" element={<ProtectedRoute><CinematicStudioPage /></ProtectedRoute>} />
            <Route path="/tools/background-creator" element={<ProtectedRoute><BackgroundCreatorPage /></ProtectedRoute>} />
            <Route path="/tools/photography-studio" element={<ProtectedRoute><PhotographyStudioPage /></ProtectedRoute>} />
            <Route path="/tools/caption-studio" element={<ProtectedRoute><CaptionStudioPage /></ProtectedRoute>} />
            <Route path="/tools/branding-studio" element={<ProtectedRoute><BrandingStudioPage /></ProtectedRoute>} />
            <Route path="/tools/prompt-engineer" element={<ProtectedRoute><PromptEngineerPage /></ProtectedRoute>} />
            <Route path="/tools/videography-studio" element={<ProtectedRoute><VideographyStudioPage /></ProtectedRoute>} />
            <Route path="/tools/logo-generator" element={<ProtectedRoute><LogoGeneratorPage /></ProtectedRoute>} />
            
            {/* Legacy routes - redirect to new paths */}
            <Route path="/photography-studio" element={<ProtectedRoute><PhotographyStudioPage /></ProtectedRoute>} />
            <Route path="/caption-studio" element={<ProtectedRoute><CaptionStudioPage /></ProtectedRoute>} />
            <Route path="/branding-studio" element={<ProtectedRoute><BrandingStudioPage /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PresenceProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
