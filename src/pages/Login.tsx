
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    document.title = "Login | Atende Agora";
  }, []);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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
