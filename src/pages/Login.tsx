
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { isLoading } = useAuth();
  
  useEffect(() => {
    document.title = "Login | Atende Agora";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(29, 40, 57)' }}>
        <div className="text-lg text-white">Carregando...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'rgb(29, 40, 57)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Atende Agora</h1>
          <p className="text-gray-300">
            Sistema de gerenciamento de atendimentos
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
