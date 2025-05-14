import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// Comente os imports das páginas por agora se quiser simplificar ao máximo
// import Dashboard from "./pages/Dashboard";
// import Login from "./pages/Login";
// import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Pode comentar PrivateRoute por agora também
/*
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
*/

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div>Página de Teste Inicial com Router</div>
          {/* Comente as Routes por agora 
          <Routes>
            <Route path="/login" element={<div>Página de Login Simples</div>} /> 
            <Route path="/dashboard" element={<div>Página de Dashboard Simples</div>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<div>Página Não Encontrada Simples</div>} />
          </Routes>
          */}
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
