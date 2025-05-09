
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Login | Atende Agora";
    
    // Verificar se o usuário já está autenticado e redirecionar para o dashboard
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // Não usar o Navigate diretamente no render, pois isso causa o loop infinito
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Atende Agora</h1>
          <p className="text-muted-foreground">
            Sistema de gerenciamento de atendimentos
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
