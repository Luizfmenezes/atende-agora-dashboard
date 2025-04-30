
import { User, Permission, UserRole } from "@/lib/types";

// Mock do banco de dados de usuários
// Em uma implementação real, você usaria uma API
const USERS: Record<string, { password: string; user: User }> = {
  "admin": {
    password: "admin123", // Na implementação real, usaria bcrypt
    user: {
      id: "1",
      username: "admin",
      role: "admin" as UserRole,
      permissions: {
        view: true,
        edit: true,
        delete: true,
        create: true
      }
    }
  },
  "user": {
    password: "user123",
    user: {
      id: "2",
      username: "user",
      role: "user" as UserRole,
      permissions: {
        view: true,
        edit: false,
        delete: false,
        create: false
      }
    }
  }
};

export const authenticate = (username: string, password: string): User | null => {
  const userRecord = USERS[username];
  if (userRecord && userRecord.password === password) {
    // Retornamos uma cópia do usuário sem a senha
    return { ...userRecord.user };
  }
  return null;
};

export const createUser = (
  username: string, 
  password: string, 
  role: UserRole, 
  permissions: Permission
): User | null => {
  // Verificar se o usuário já existe
  if (USERS[username]) {
    return null;
  }
  
  // Criar novo usuário
  const newUser = {
    id: Date.now().toString(),
    username,
    role,
    permissions
  };
  
  // Em um cenário real, você salvaria isso no banco de dados
  USERS[username] = {
    password, // Novamente, use bcrypt em produção
    user: newUser
  };
  
  return { ...newUser };
};

export const validatePermission = (user: User | null, permission: keyof Permission): boolean => {
  if (!user) return false;
  
  // Administradores sempre têm todas as permissões
  if (user.role === "admin") return true;
  
  // Verificar permissão específica
  return user.permissions[permission] || false;
};

export const getUserDisplayName = (user: User): string => {
  return user.username;
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin";
};
