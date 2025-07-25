
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AddPet from "./pages/AddPet";
import LostPet from "./pages/LostPet";
import PublicProfile from "./pages/PublicProfile";
import PublicCareInstructions from "./pages/PublicCareInstructions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("App: Starting application render");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/add-pet" element={
                <ProtectedRoute>
                  <AddPet />
                </ProtectedRoute>
              } />
              <Route path="/lost-pet/:petId?" element={
                <ProtectedRoute>
                  <LostPet />
                </ProtectedRoute>
              } />
              <Route path="/profile/:petId" element={<PublicProfile />} />
              <Route path="/care/:petId" element={<PublicCareInstructions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
