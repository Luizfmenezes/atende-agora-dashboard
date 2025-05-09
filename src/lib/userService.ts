
import { supabase } from "@/integrations/supabase/client";
import { User, Permission, UserRole } from "@/lib/types";

// Interfaces para representar os dados do banco
interface DbUser {
  id: number;
  username: string;
  password: string;
  role: string;
  created_at: string;
}

interface DbPermission {
  usuario_id: number;
  view: boolean;
  edit: boolean;
  delete: boolean;
  can_create: boolean;
}

// Função auxiliar para converter dados do DB para o formato da aplicação
const mapDbUserToAppUser = (
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

// Serviço de autenticação
export const authService = {
  // Autenticar usuário
  async authenticateWithSupabase(username: string, password: string): Promise<User | null> {
    try {
      // Buscar o usuário pelo nome de usuário e senha
      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .eq('password', password) // Em produção, usaria comparação de hash
        .single();
      
      if (userError || !user) {
        console.error("Erro ao autenticar:", userError);
        return null;
      }
      
      // Buscar as permissões do usuário
      const { data: permissions, error: permError } = await supabase
        .from('permissoes')
        .select('*')
        .eq('usuario_id', user.id)
        .single();
      
      if (permError) {
        console.error("Erro ao buscar permissões:", permError);
        return null;
      }
      
      // Converter para o formato da aplicação
      return mapDbUserToAppUser(user, permissions);
    } catch (error) {
      console.error("Erro no serviço de autenticação:", error);
      return null;
    }
  }
};

// Serviço de gerenciamento de usuários
export const userService = {
  // Criar novo usuário
  async createUserInSupabase(
    username: string, 
    password: string, 
    role: UserRole, 
    permissions: Permission
  ): Promise<User | null> {
    try {
      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        console.error("Usuário já existe");
        return null;
      }
      
      // Inserir novo usuário
      const { data: newUser, error: userError } = await supabase
        .from('usuarios')
        .insert([{ username, password, role }])
        .select()
        .single();
      
      if (userError || !newUser) {
        console.error("Erro ao criar usuário:", userError);
        return null;
      }
      
      // Inserir permissões do usuário
      const { error: permError } = await supabase
        .from('permissoes')
        .insert([{ 
          usuario_id: newUser.id, 
          view: permissions.view, 
          edit: permissions.edit, 
          delete: permissions.delete, 
          can_create: permissions.create 
        }]);
      
      if (permError) {
        console.error("Erro ao criar permissões:", permError);
        // Excluir o usuário criado para manter a consistência
        await supabase.from('usuarios').delete().eq('id', newUser.id);
        return null;
      }
      
      // Retornar o usuário criado com suas permissões
      return {
        id: newUser.id.toString(),
        username: newUser.username,
        role: newUser.role as UserRole,
        permissions
      };
    } catch (error) {
      console.error("Erro no serviço de criação de usuário:", error);
      return null;
    }
  },

  // Buscar todos os usuários
  async getAllUsers(): Promise<User[]> {
    try {
      // Buscar todos os usuários
      const { data: users, error: usersError } = await supabase
        .from('usuarios')
        .select('*')
        .order('username');
      
      if (usersError || !users) {
        console.error("Erro ao buscar usuários:", usersError);
        return [];
      }
      
      // Buscar todas as permissões
      const { data: permissions, error: permsError } = await supabase
        .from('permissoes')
        .select('*');
      
      if (permsError || !permissions) {
        console.error("Erro ao buscar permissões:", permsError);
        return [];
      }
      
      // Mapear usuários e suas permissões
      return users.map((user: DbUser) => {
        const userPerms = permissions.find((p: DbPermission) => p.usuario_id === user.id);
        return mapDbUserToAppUser(user, userPerms || null);
      });
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  },

  // Buscar usuário por ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();
      
      if (userError || !user) {
        console.error(`Erro ao buscar usuário ${id}:`, userError);
        return null;
      }
      
      const { data: permissions, error: permError } = await supabase
        .from('permissoes')
        .select('*')
        .eq('usuario_id', user.id)
        .single();
      
      if (permError) {
        console.error(`Erro ao buscar permissões do usuário ${id}:`, permError);
        return null;
      }
      
      return mapDbUserToAppUser(user, permissions);
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      return null;
    }
  }
};

// Para compatibilidade com código existente
export const authenticateWithSupabase = authService.authenticateWithSupabase;
export const createUserInSupabase = userService.createUserInSupabase;
export const getUsersFromSupabase = userService.getAllUsers;

