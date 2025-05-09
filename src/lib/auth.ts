
import { User, Permission, UserRole } from "@/lib/types";
import { authService, userService } from "@/lib/userService";

export const authenticate = async (username: string, password: string): Promise<User | null> => {
  return await authService.authenticateWithSupabase(username, password);
};

export const createUser = async (
  username: string, 
  password: string, 
  role: UserRole, 
  permissions: Permission
): Promise<User | null> => {
  return await userService.createUserInSupabase(username, password, role, permissions);
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
