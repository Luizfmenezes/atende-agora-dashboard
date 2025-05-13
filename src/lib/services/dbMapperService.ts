import { User, Permission, UserRole } from "@/lib/types";

// Interfaces para representar os dados do banco (adaptadas)
export interface DbUser {
  id: number;
  username: string;
  // password: string; // Removido - o hash da password é tratado no authService e não deve ser mapeado aqui
  role: string;
  created_at?: string; // Tornado opcional, ajuste conforme a sua BD SQL Server
  // Adicione outros campos que são retornados pela sua query SQL e são necessários para o mapeamento
}

export interface DbPermission {
  usuario_id: number;
  view: boolean;
  edit: boolean;
  delete: boolean;
  can_create: boolean; // Mantido como no original, verifique se o nome da coluna é este no SQL Server
}

// Função auxiliar para converter dados do DB para o formato da aplicação
export const mapDbUserToAppUser = (
  dbUserData: DbUser, // Renomeado para clareza
  dbPermissionData: DbPermission | null // Renomeado para clareza
): User | null => {
  // Validação básica para garantir que temos os dados essenciais do utilizador
  if (!dbUserData || typeof dbUserData.id === "undefined" || !dbUserData.username) {
    console.error("Dados insuficientes do utilizador da BD para mapeamento.", dbUserData);
    return null; // Retorna null se os dados base do utilizador não estiverem presentes
  }

  return {
    id: dbUserData.id.toString(),
    username: dbUserData.username,
    role: dbUserData.role as UserRole,
    permissions: dbPermissionData ? {
      view: dbPermissionData.view,
      edit: dbPermissionData.edit,
      delete: dbPermissionData.delete,
      create: dbPermissionData.can_create // "create" na app, "can_create" na BD (conforme original)
    } : {
      // Permissões padrão se não houver registo explícito
      view: true,
      edit: false,
      delete: false,
      create: false
    }
  };
};
