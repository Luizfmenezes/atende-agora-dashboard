// src/contexts/AuthContext.tsx - Testando com useEffect e localStorage

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // REINTRODUZIDO: Verificar se o usuário está salvo no localStorage ao iniciar
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
        localStorage.removeItem("user"); // Limpar se estiver corrompido
      }
    }
  }, []);

  // Lógica de login simplificada (NÃO chama API externa ainda)
  const login = async (username: string, password: string): Promise<boolean> => {
    console.log("Login SIMULADO chamado com:", username, password);
    const mockUser: User = { id: "1", username: username, role: "user", permissions: { view: true, edit: false, delete: false, create: false } }; 
    setUser(mockUser);
    // Não vamos mexer no localStorage aqui nesta fase de teste simplificado do login
    console.log("Utilizador simulado definido:", mockUser);
    return true;
  };

  // Lógica de logout simplificada
  const logout = () => {
    console.log("Logout SIMULADO chamado");
    setUser(null);
    localStorage.removeItem("user"); // Removendo do localStorage no logout simulado
  };

  console.log("AuthProvider com useEffect está a renderizar. Utilizador atual:", user);

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
