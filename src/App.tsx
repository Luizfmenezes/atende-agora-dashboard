import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // Comentado

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* <AuthProvider> */}{/* Comentado */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div>Página de Teste Inicial com Router SEM AUTH</div>
        </BrowserRouter>
      </TooltipProvider>
    {/* </AuthProvider> */}{/* Comentado */}
  </QueryClientProvider>
);

export default App;
