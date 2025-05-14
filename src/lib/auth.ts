import { User, Permission, UserRole } from "@/lib/types";
import { authService, userService } from "@/lib/userService";

export const authenticate = async (username: string, password: string): Promise<User | null> => {
  return await authService.authenticateWithSQLServer(username, password);
};

export const createUser = async (
  username: string, 
  password: string, 
  role: UserRole, 
  permissions: Permission
): Promise<User | null> => {
  return await userService.createUserInSQLServer(username, password, role, permissions);
};

// As outras funções (validatePermission, isAdmin etc.) continuam iguais.
