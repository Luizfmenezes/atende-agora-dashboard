
import { User, Permission, UserRole } from "@/lib/types";

// Interfaces para representar os dados do banco
export interface DbUser {
  id: number;
  username: string;
  password: string;
  role: string;
  created_at: string;
}

export interface DbPermission {
  usuario_id: number;
  view: boolean;
  edit: boolean;
  delete: boolean;
  can_create: boolean;
}

// Função auxiliar para converter dados do DB para o formato da aplicação
export const mapDbUserToAppUser = (
  user: DbUser, 
  permissions: DbPermission | null
): User => {
  return {
    id: user.id.toString(),
    username: user.username,
    role: user.role as UserRole,
    permissions: permissions ? {
      view: permissions.view,
      edit: permissions.edit,
      delete: permissions.delete,
      create: permissions.can_create
    } : {
      view: true,
      edit: false,
      delete: false,
      create: false
    }
  };
};
