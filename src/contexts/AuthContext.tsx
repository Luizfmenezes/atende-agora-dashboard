
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Login temporário para desenvolvimento
const TEMP_LOGIN = {
  username: "adm",
  password: "adm123"
};

const TEMP_USER: User = {
  id: "temp-admin-001",
  username: "adm",
  role: "admin",
  permissions: {
    view: true,
    edit: true,
    delete: true,
    create: true
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Verificar se o usuário está salvo no localStorage ao iniciar
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("auth_token");
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Error parsing stored user", e);
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Verificar login temporário primeiro
      if (username === TEMP_LOGIN.username && password === TEMP_LOGIN.password) {
        setUser(TEMP_USER);
        localStorage.setItem("user", JSON.stringify(TEMP_USER));
        localStorage.setItem("auth_token", "temp-token-admin");
        
        toast({
          title: "Login bem sucedido",
          description: `Bem-vindo, ${TEMP_USER.username}! (Login temporário)`,
        });
        return true;
      }

      // Se não for o login temporário, tentar autenticação com API
      // Comentado para evitar erros enquanto não há API funcionando
      /*
      const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(error.error || 'Erro na autenticação');
      }

      const data = await response.json();
      
      if (data.user && data.token) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("auth_token", data.token);
        
        toast({
          title: "Login bem sucedido",
          description: `Bem-vindo, ${data.user.username}!`,
        });
        return true;
      }
      */

      // Se chegou aqui, as credenciais estão incorretas
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Usuário ou senha incorretos",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
