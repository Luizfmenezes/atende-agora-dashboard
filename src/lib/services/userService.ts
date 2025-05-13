// src/lib/services/userService.ts
import sql from "mssql";
import { executeQuery, getDbPool } from "@/integrations/sqlserver/client";
import { User, Permission, UserRole } from "@/lib/types"; // Tipos da aplicação
import { DbUser, DbPermission, mapDbUserToAppUser } from "./dbMapperService"; // Mapper, ajustar se necessário
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // Para bcrypt

// Criar novo usuário com SQL Server
export const createUser = async (
  username: string,
  passwordPlain: string,
  role: UserRole,
  permissions: Permission // Objeto de permissão da aplicação
): Promise<User | null> => {
  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);

  try {
    // Verificar se o usuário já existe (fora da transação ou no início dela)
    const checkUserQuery = "SELECT id FROM usuarios WHERE username = @username";
    const existingUserResult = await pool.request()
      .input("username", sql.NVarChar, username)
      .query(checkUserQuery);

    if (existingUserResult.recordset.length > 0) {
      console.error(`Erro ao criar usuário: Usuário ${username} já existe.`);
      // Não é um erro de transação, apenas uma falha de pré-condição
      return null; 
    }

    await transaction.begin();

    // Hashear a password
    const passwordHash = await bcrypt.hash(passwordPlain, SALT_ROUNDS);

    // Inserir novo usuário
    // A tabela usuarios deve ter: id (identity), username, password_hash, role
    const insertUserQuery = `
      INSERT INTO usuarios (username, password_hash, role)
      OUTPUT inserted.id, inserted.username, inserted.role
      VALUES (@username, @passwordHash, @role);
    `;
    const userInsertResult = await transaction.request()
      .input("username", sql.NVarChar, username)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .input("role", sql.NVarChar, role) // Assumindo que UserRole é compatível com o tipo da coluna role
      .query(insertUserQuery);

    if (userInsertResult.recordset.length === 0) {
      throw new Error("Falha ao inserir usuário na base de dados.");
    }
    const newDbUser = userInsertResult.recordset[0] as { id: number; username: string; role: string };

    // Inserir permissões do usuário
    // A tabela permissoes deve ter: id (identity), usuario_id, view, edit, delete, can_create
    const insertPermissionsQuery = `
      INSERT INTO permissoes (usuario_id, view, edit, delete, can_create)
      VALUES (@usuario_id, @view, @edit, @delete, @can_create);
    `;
    await transaction.request()
      .input("usuario_id", sql.Int, newDbUser.id)
      .input("view", sql.Bit, permissions.view)
      .input("edit", sql.Bit, permissions.edit)
      .input("delete", sql.Bit, permissions.delete)
      .input("can_create", sql.Bit, permissions.create) // Nome da coluna no Supabase era "can_create"
      .query(insertPermissionsQuery);

    await transaction.commit();

    console.log(`Usuário ${username} e suas permissões criados com sucesso.`);
    
    // Retornar o usuário criado no formato da aplicação
    return {
      id: newDbUser.id.toString(),
      username: newDbUser.username,
      role: newDbUser.role as UserRole,
      permissions: permissions // As permissões que foram passadas para criação
    };

  } catch (error) {
    console.error("Erro transacional ao criar usuário e permissões (SQL Server):", error);
    if (transaction.rolledBack === false && transaction.active) {
        try {
            await transaction.rollback();
            console.log("Transação revertida devido a erro.");
        } catch (rollbackError) {
            console.error("Erro ao reverter transação:", rollbackError);
        }
    }
    return null;
  }
};

// Buscar todos os usuários com SQL Server
export const getAllUsers = async (): Promise<User[]> => {
  try {
    // Query para buscar usuários e suas permissões (usando LEFT JOIN)
    const query = `
      SELECT 
        u.id, u.username, u.role,
        p.view, p.edit, p.delete, p.can_create
      FROM usuarios u
      LEFT JOIN permissoes p ON u.id = p.usuario_id
      ORDER BY u.username;
    `;
    const result = await executeQuery(query);

    // Mapear para o formato da aplicação
    return result.recordset.map(row => {
      const dbUser: DbUser = {
        id: row.id,
        username: row.username,
        role: row.role,
        // outros campos de DbUser se houver
      };
      const dbPermission: DbPermission | null = (
        row.view !== null && row.view !== undefined // Checar se há alguma permissão
      ) ? {
        usuario_id: row.id, // ou p.usuario_id se selecionado explicitamente
        view: row.view,
        edit: row.edit,
        delete: row.delete,
        can_create: row.can_create
        // outros campos de DbPermission se houver
      } : null;
      
      return mapDbUserToAppUser(dbUser, dbPermission);
    }).filter(user => user !== null) as User[]; // Filtrar nulos se mapDbUserToAppUser puder retornar null

  } catch (error) {
    console.error("Erro ao buscar todos os usuários (SQL Server):", error);
    throw error; // ou return [];
  }
};

// Buscar usuário por ID com SQL Server
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error(`ID de usuário inválido fornecido: ${id}`);
      return null;
    }

    const query = `
      SELECT 
        u.id, u.username, u.role,
        p.view, p.edit, p.delete, p.can_create
      FROM usuarios u
      LEFT JOIN permissoes p ON u.id = p.usuario_id
      WHERE u.id = @userId;
    `;
    const result = await executeQuery(query, [
      { name: "userId", type: sql.Int, value: numericId }
    ]);

    if (result.recordset.length === 0) {
      return null; // Usuário não encontrado
    }

    const row = result.recordset[0];
    const dbUser: DbUser = {
      id: row.id,
      username: row.username,
      role: row.role,
    };
    const dbPermission: DbPermission | null = (
      row.view !== null && row.view !== undefined
    ) ? {
      usuario_id: row.id,
      view: row.view,
      edit: row.edit,
      delete: row.delete,
      can_create: row.can_create
    } : null;

    return mapDbUserToAppUser(dbUser, dbPermission);

  } catch (error) {
    console.error(`Erro ao buscar usuário por ID ${id} (SQL Server):`, error);
    throw error; // ou return null;
  }
};

// Adicionar a dependência `bcrypt` e `@types/bcrypt` ao seu package.json:
// npm install bcrypt
// npm install --save-dev @types/bcrypt
// ou
// yarn add bcrypt
// yarn add --dev @types/bcrypt

