
import { supabase } from "@/integrations/supabase/client";
import { User, Permission, UserRole } from "@/lib/types";

// Interface para representar os usuários no banco de dados
interface DbUser {
  id: number;
  username: string;
  password: string;
  role: string;
  created_at: string;
}

// Interface para representar as permissões no banco de dados
interface DbPermission {
  usuario_id: number;
  view: boolean;
  edit: boolean;
  delete: boolean;
  can_create: boolean;
}

export const authenticateWithSupabase = async (username: string, password: string): Promise<User | null> => {
  try {
    // Buscar o usuário pelo nome de usuário
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
    
    if (permError || !permissions) {
      console.error("Erro ao buscar permissões:", permError);
      return null;
    }
    
    // Converter os tipos do banco para os tipos da aplicação
    return {
      id: user.id.toString(),
      username: user.username,
      role: user.role as UserRole,
      permissions: {
        view: permissions.view,
        edit: permissions.edit,
        delete: permissions.delete,
        create: permissions.can_create
      }
    };
  } catch (error) {
    console.error("Erro no serviço de autenticação:", error);
    return null;
  }
};

export const createUserInSupabase = async (
  username: string, 
  password: string, 
  role: UserRole, 
  permissions: Permission
): Promise<User | null> => {
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
    
    // Retornar o usuário criado
    return {
      id: newUser.id.toString(),
      username: newUser.username,
      role: newUser.role as UserRole,
      permissions: {
        view: permissions.view,
        edit: permissions.edit,
        delete: permissions.delete,
        create: permissions.create
      }
    };
  } catch (error) {
    console.error("Erro no serviço de criação de usuário:", error);
    return null;
  }
};

export const getUsersFromSupabase = async (): Promise<User[]> => {
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
      const userPerms = permissions.find((p: DbPermission) => p.usuario_id === user.id) || {
        view: true,
        edit: false,
        delete: false,
        can_create: false
      };
      
      return {
        id: user.id.toString(),
        username: user.username,
        role: user.role as UserRole,
        permissions: {
          view: userPerms.view,
          edit: userPerms.edit,
          delete: userPerms.delete,
          create: userPerms.can_create
        }
      };
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};
