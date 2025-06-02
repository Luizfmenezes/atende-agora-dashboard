
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { API_CONFIG } from "@/lib/config/database";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      } else {
        throw new Error('Dados de autenticação inválidos');
      }
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
