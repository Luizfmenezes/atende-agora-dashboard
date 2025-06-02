
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Atende Agora</h1>
          <p className="text-gray-600">
            Sistema de gerenciamento de atendimentos
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-6 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Login temporário:</strong><br />
              Usuário: <code className="bg-yellow-100 px-1 rounded">adm</code><br />
              Senha: <code className="bg-yellow-100 px-1 rounded">adm123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
