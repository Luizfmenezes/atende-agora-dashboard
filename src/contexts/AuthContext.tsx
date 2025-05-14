// src/contexts/AuthContext.tsx - Testando com lógica de login completa

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { authenticate } from "@/lib/auth"; // REINTRODUZIDO - Certifique-se que este caminho está correto

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthContext: useEffect para localStorage está a ser executado.");
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("AuthContext: Utilizador carregado do localStorage:", parsedUser);
      } catch (e) {
        console.error("AuthContext: Erro ao fazer parse do utilizador guardado", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // LÓGICA DE LOGIN COMPLETA REINTRODUZIDA
  const login = async (username: string, password: string): Promise<boolean> => {
    console.log("AuthContext: Tentativa de login com:", username);
    try {
      const authenticatedUser = await authenticate(username, password); // Chamada à sua função real
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem("user", JSON.stringify(authenticatedUser)); // Guardar no localStorage
        toast({
          title: "Login bem sucedido",
          description: `Bem-vindo, ${authenticatedUser.username}!`, 
        });
        console.log("AuthContext: Login bem sucedido, utilizador:", authenticatedUser);
        return true;
      } else {
        toast({
          title: "Falha no login",
          description: "Usuário ou senha incorretos",
          variant: "destructive",
        });
        console.warn("AuthContext: Falha no login - utilizador ou senha incorretos.");
        return false;
      }
    } catch (error) {
      console.error("AuthContext: Erro durante o login:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao fazer login. Verifique a consola.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    console.log("AuthContext: Logout chamado");
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta",
    });
  };

  console.log("AuthProvider com lógica de login completa está a renderizar. Utilizador atual:", user);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
