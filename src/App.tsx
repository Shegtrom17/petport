
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
import { SafeErrorBoundary } from "@/components/SafeErrorBoundary";
import { IOSRefreshPrompt } from "@/components/IOSRefreshPrompt";
import { AuthKeepAliveWrapper } from "@/components/AuthKeepAliveWrapper";
import { initializeDomainGuard } from "@/utils/domainGuard";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Learn from "./pages/Learn";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";

import AddPet from "./pages/AddPet";
import Profile from "./pages/Profile";

import PublicProfile from "./pages/PublicProfile";
import PublicCareInstructions from "./pages/PublicCareInstructions";
import PublicMissingPet from "./pages/PublicMissingPet";
import PublicTravelMap from "./pages/PublicTravelMap";
import NotFound from "./pages/NotFound";

import TransferAccept from "./pages/TransferAccept";
import PublicResume from "./pages/PublicResume";
import PublicReviews from "./pages/PublicReviews";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import PostCheckout from "./pages/PostCheckout";
import ClaimSubscription from "./pages/ClaimSubscription";
import Subscribe from "./pages/Subscribe";
import Reactivate from "./pages/Reactivate";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import Billing from "./pages/Billing";
import VaccinationGuide from "./pages/VaccinationGuide";
import Help from "./pages/Help";
import PublicGallery from "./pages/PublicGallery";
import PublicEmergencyProfile from "./pages/PublicEmergencyProfile";
import EmailTest from "./pages/EmailTest";
import SetupStripe from "./pages/SetupStripe";
import Referrals from "./pages/Referrals";

// Redirect component for credentials -> resume consolidation
const CredentialsRedirect = () => {
  const { petId } = useParams();
  return <Navigate to={`/resume/${petId}`} replace />;
};

const queryClient = new QueryClient();

const App = () => {
  console.log("App: Starting application render");
  
  // Initialize domain guard on app start
  React.useEffect(() => {
    initializeDomainGuard();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <AuthKeepAliveWrapper>
              <SafeErrorBoundary level="page" name="Application Root">
                <ErrorBoundary>
                  <Toaster />
                  <Sonner />
                
                <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  
                  <Route path="/" element={<Landing />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/learn" element={<Learn />} />
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
                    <Route path="/travel/:petId" element={<PublicTravelMap />} />
                  <Route path="/transfer/accept/:token" element={<TransferAccept />} />
                  <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/payment-canceled" element={<PaymentCanceled />} />
                  <Route path="/post-checkout" element={<PostCheckout />} />
                  <Route path="/claim-subscription" element={<ClaimSubscription />} />
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
                     <Route path="/setup-stripe" element={
                       <ProtectedRoute>
                         <SetupStripe />
                       </ProtectedRoute>
                     } />
                     <Route path="/referrals" element={
                       <ProtectedRoute>
                         <Referrals />
                       </ProtectedRoute>
                     } />
                   <Route path="*" element={<NotFound />} />
                  </Routes>
                  <IOSRefreshPrompt />
                  </BrowserRouter>
                 </ErrorBoundary>
              </SafeErrorBoundary>
             </AuthKeepAliveWrapper>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
