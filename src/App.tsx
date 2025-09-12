
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthKeepAliveWrapper } from "@/components/AuthKeepAliveWrapper";
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
import PublicResume from "./pages/PublicResume";
import PublicReviews from "./pages/PublicReviews";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import PostCheckout from "./pages/PostCheckout";
import Subscribe from "./pages/Subscribe";
import Reactivate from "./pages/Reactivate";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Billing from "./pages/Billing";
import VaccinationGuide from "./pages/VaccinationGuide";
import Help from "./pages/Help";
import PublicGallery from "./pages/PublicGallery";
import PublicEmergencyProfile from "./pages/PublicEmergencyProfile";
import EmailTest from "./pages/EmailTest";

// Redirect component for credentials -> resume consolidation
const CredentialsRedirect = () => {
  const { petId } = useParams();
  return <Navigate to={`/resume/${petId}`} replace />;
};

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
          <AuthProvider>
            <AuthKeepAliveWrapper>
              <ErrorBoundary>
                <Toaster />
                <Sonner />
                <TestModeRibbon />
                <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<Landing />} />
                  <Route path="/landing" element={<Landing />} />
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
                   <Route path="/vaccination-guide" element={
                     <ProtectedRoute>
                       <VaccinationGuide />
                     </ProtectedRoute>
                   } />
                     <Route path="/profile/:petId" element={<PublicProfile />} />
                     <Route path="/emergency/:petId" element={<PublicEmergencyProfile />} />
                     <Route path="/care/:petId" element={<PublicCareInstructions />} />
                     <Route path="/credentials/:petId" element={<CredentialsRedirect />} />
                     <Route path="/resume/:petId" element={<PublicResume />} />
                    <Route path="/reviews/:petId" element={<PublicReviews />} />
                   <Route path="/missing-pet/:petId" element={<PublicMissingPet />} />
                   <Route path="/gallery/:petId" element={<PublicGallery />} />
                  <Route path="/transfer/:token" element={<TransferAccept />} />
                  <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-canceled" element={<PaymentCanceled />} />
                  <Route path="/post-checkout" element={<PostCheckout />} />
                  <Route path="/billing" element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  } />
                     <Route path="/subscribe" element={
                       <ProtectedRoute>
                         <Subscribe />
                       </ProtectedRoute>
                     } />
                     <Route path="/reactivate" element={
                       <ProtectedRoute>
                         <Reactivate />
                       </ProtectedRoute>
                     } />
                    <Route path="/help" element={
                      <ProtectedRoute>
                        <Help />
                      </ProtectedRoute>
                    } />
                    <Route path="/email-test" element={
                      <ProtectedRoute>
                        <EmailTest />
                      </ProtectedRoute>
                    } />
                   <Route path="*" element={<NotFound />} />
                </Routes>
                </BrowserRouter>
              </ErrorBoundary>
            </AuthKeepAliveWrapper>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
