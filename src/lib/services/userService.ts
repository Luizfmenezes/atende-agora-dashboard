
import { supabase } from "@/integrations/supabase/client";
import { User, Permission, UserRole } from "@/lib/types";
import { DbUser, DbPermission, mapDbUserToAppUser } from "./dbMapperService";

// Criar novo usuário
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
};

// Buscar todos os usuários
export const getAllUsers = async (): Promise<User[]> => {
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
};

// Buscar usuário por ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    // Converter o ID de string para número
    const numericId = parseInt(id, 10);
    
    // Verificar se a conversão foi bem-sucedida
    if (isNaN(numericId)) {
      console.error(`ID inválido: ${id} não é um número válido`);
      return null;
    }
    
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', numericId)
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
    
    return mapDbUserToAppUser(user as DbUser, permissions as DbPermission);
  } catch (error) {
    console.error(`Erro ao buscar usuário ${id}:`, error);
    return null;
  }
};
