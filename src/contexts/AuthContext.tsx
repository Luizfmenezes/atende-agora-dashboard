// src/contexts/AuthContext.tsx - Testando com useEffect e useToast

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast"; // REINTRODUZIDO

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast(); // REINTRODUZIDO

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

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log("Login SIMULADO chamado com:", username, password);
    const mockUser: User = { id: "1", username: username, role: "user", permissions: { view: true, edit: false, delete: false, create: false } }; 
    setUser(mockUser);
    // localStorage.setItem("user", JSON.stringify(mockUser)); // Ainda não vamos guardar no login simulado
    toast({ // REINTRODUZIDO (exemplo)
      title: "Login Simulado OK",
      description: `Bem-vindo (simulado), ${username}!`, 
    });
    console.log("Utilizador simulado definido:", mockUser);
    return true;
  };

  const logout = () => {
    console.log("Logout SIMULADO chamado");
    setUser(null);
    localStorage.removeItem("user");
    toast({ // REINTRODUZIDO (exemplo)
      title: "Logout Simulado OK",
    });
  };

  console.log("AuthProvider com useEffect e useToast está a renderizar. Utilizador atual:", user);

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
