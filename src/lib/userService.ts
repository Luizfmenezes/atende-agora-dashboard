
import { authService, userService as sqlServerUserService } from "@/lib/services/sqlServerService";

// Serviço de autenticação
export const exportedAuthService = {
  authenticateWithSupabase: authService.authenticate
};

// Serviço de gerenciamento de usuários
export const userService = {
  createUserInSupabase: sqlServerUserService.createUser,
  getAllUsers: sqlServerUserService.getAllUsers,
  getUserById: sqlServerUserService.getUserById
};

// Para compatibilidade com código existente
export const getUsersFromSupabase = sqlServerUserService.getAllUsers;
export const authenticateWithSupabase = authService.authenticate;
export const createUserInSupabase = sqlServerUserService.createUser;
