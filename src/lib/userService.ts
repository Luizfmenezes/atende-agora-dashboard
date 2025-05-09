
import { authenticateWithSupabase } from './services/authService';
import { createUserInSupabase, getAllUsers, getUserById } from './services/userService';

// Serviço de autenticação
export const authService = {
  authenticateWithSupabase
};

// Serviço de gerenciamento de usuários
export const userService = {
  createUserInSupabase,
  getAllUsers,
  getUserById
};

// Para compatibilidade com código existente
export const getUsersFromSupabase = getAllUsers;
export { authenticateWithSupabase, createUserInSupabase };
