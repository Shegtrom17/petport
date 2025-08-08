
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import AddPet from "./pages/AddPet";
import Profile from "./pages/Profile";
import LostPet from "./pages/LostPet";
import PublicProfile from "./pages/PublicProfile";
import PublicCareInstructions from "./pages/PublicCareInstructions";
import PublicMissingPet from "./pages/PublicMissingPet";
import NotFound from "./pages/NotFound";
import { TestModeRibbon } from "@/components/TestModeRibbon";
import TransferAccept from "./pages/TransferAccept";

const queryClient = new QueryClient();

const App = () => {
  console.log("App: Starting application render");
  
  // Register service worker for PWA functionality
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(() => console.log('Service Worker registration failed'));
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <TestModeRibbon />
            <BrowserRouter>
              <AuthProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/add-pet" element={
                  <ProtectedRoute>
                    <AddPet />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/lost-pet/:petId?" element={
                  <ProtectedRoute>
                    <LostPet />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                <Route path="/profile/:petId" element={<PublicProfile />} />
                <Route path="/care/:petId" element={<PublicCareInstructions />} />
                <Route path="/missing-pet/:petId" element={<PublicMissingPet />} />
                <Route path="/transfer/:token" element={<TransferAccept />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
