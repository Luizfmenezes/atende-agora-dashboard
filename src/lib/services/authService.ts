// src/lib/services/authService.ts
import sql from "mssql";
import { executeQuery } from "@/integrations/sqlserver/client";
import { User } from "@/lib/types";
import { DbUser, DbPermission, mapDbUserToAppUser } from "./dbMapperService"; // Assumindo que este mapper ainda é útil ou será adaptado
import bcrypt from "bcrypt"; // Adicionar bcrypt para comparação de hash de password

// Serviço de autenticação adaptado para SQL Server
export const authenticateUser = async (username: string, passwordAttempt: string): Promise<User | null> => {
  try {
    // 1. Buscar o usuário pelo nome de usuário
    // A tabela 'usuarios' no SQL Server deve ter colunas como: id, username, password_hash, role, etc.
    const userQuery = "SELECT id, username, password_hash, role FROM usuarios WHERE username = @username";
    const userResult = await executeQuery(userQuery, [
      { name: "username", type: sql.NVarChar, value: username }
    ]);

    if (userResult.recordset.length === 0) {
      console.log(`Tentativa de login falhou: Usuário ${username} não encontrado.`);
      return null; // Usuário não encontrado
    }

    const dbUser = userResult.recordset[0] as { id: number; username: string; password_hash: string; role: string; /* outros campos */ };

    // 2. Comparar a password fornecida com o hash armazenado
    // É CRUCIAL que a coluna 'password_hash' armazene o hash da password (ex: bcrypt)
    const passwordMatch = await bcrypt.compare(passwordAttempt, dbUser.password_hash);

    if (!passwordMatch) {
      console.log(`Tentativa de login falhou: Password incorreta para o usuário ${username}.`);
      return null; // Password incorreta
    }

    // 3. Buscar as permissões do usuário
    // A tabela 'permissoes' no SQL Server deve ter colunas como: id, usuario_id, view, edit, delete, can_create, etc.
    const permissionsQuery = "SELECT usuario_id, view, edit, delete, can_create FROM permissoes WHERE usuario_id = @userId";
    const permissionsResult = await executeQuery(permissionsQuery, [
      { name: "userId", type: sql.Int, value: dbUser.id }
    ]);

    let dbPermission: DbPermission | null = null;
    if (permissionsResult.recordset.length > 0) {
      dbPermission = permissionsResult.recordset[0] as DbPermission;
    } else {
      // Lidar com o caso de não haver permissões explícitas? 
      // Pode ser um erro ou pode significar permissões padrão/nenhuma.
      console.warn(`Nenhuma permissão explícita encontrada para o usuário ${username} (ID: ${dbUser.id}).`);
      // Dependendo da lógica de negócio, pode retornar null ou um objeto de permissão padrão.
      // Para manter similaridade com o original que esperava uma permissão, vamos retornar null se não encontrar.
      // Se for crítico, pode ser melhor lançar um erro ou ter permissões default.
      // return null; 
      // Ou, se o mapDbUserToAppUser puder lidar com dbPermission como null:
    }
    
    // 4. Converter para o formato da aplicação
    // O mapDbUserToAppUser precisa ser compatível com os campos retornados do SQL Server.
    // O tipo DbUser pode precisar de ajuste para incluir `password_hash` e outros campos do SQL Server.
    // Para o mapeamento, passamos o que temos do utilizador da BD e as suas permissões.
    const appUser = mapDbUserToAppUser(
        { id: dbUser.id, username: dbUser.username, role: dbUser.role /* outros campos de DbUser */ } as DbUser, 
        dbPermission // Pode ser null se não houver permissões e o mapper tratar isso
    );

    if (!appUser) {
        console.error("Falha ao mapear o usuário da BD para o formato da aplicação.");
        return null;
    }

    console.log(`Usuário ${username} autenticado com sucesso.`);
    return appUser;

  } catch (error) {
    console.error("Erro no serviço de autenticação (SQL Server):", error);
    // Em caso de erro, não vazar detalhes, apenas falha na autenticação.
    return null;
  }
};

// NOTA DE SEGURANÇA:
// - As passwords NUNCA devem ser armazenadas em texto plano. Use bcrypt (ou similar) para hashear as passwords no momento da criação/atualização do usuário.
// - A comparação de passwords deve ser feita usando `bcrypt.compare()`.
// - Considere usar stored procedures para algumas dessas lógicas no SQL Server para maior segurança e encapsulamento.
// - A dependência `bcrypt` precisa ser adicionada ao package.json: `npm install bcrypt @types/bcrypt` ou `yarn add bcrypt @types/bcrypt`

