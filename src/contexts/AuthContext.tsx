// Versão SIMPLIFICADA de src/contexts/AuthContext.tsx para TESTE

import React, { createContext, useState, useContext, ReactNode } from "react";
import { User } from "@/lib/types"; // Vamos assumir que o tipo User é simples

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Lógica de login simplificada (não chama API externa)
  const login = async (username: string, password: string): Promise<boolean> => {
    console.log("Login SIMULADO chamado com:", username, password);
    // Simular um utilizador para teste - ajuste a estrutura de 'User' conforme necessário
    const mockUser: User = { id: "1", username: username, role: "user", permissions: { view: true, edit: false, delete: false, create: false } }; 
    setUser(mockUser);
    console.log("Utilizador simulado definido:", mockUser);
    return true;
  };

  // Lógica de logout simplificada
  const logout = () => {
    console.log("Logout SIMULADO chamado");
    setUser(null);
  };

  console.log("AuthProvider SIMPLIFICADO está a renderizar. Utilizador atual:", user);

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
