
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/types";
import { DbUser, DbPermission, mapDbUserToAppUser } from "./dbMapperService";

// Serviço de autenticação
export const authenticateWithSupabase = async (username: string, password: string): Promise<User | null> => {
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
    return mapDbUserToAppUser(user as DbUser, permissions as DbPermission);
  } catch (error) {
    console.error("Erro no serviço de autenticação:", error);
    return null;
  }
};
