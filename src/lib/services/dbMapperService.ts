import sql from "mssql";
import { mapDbUserToAppUser, DbUser, DbPermission } from "./dbMapperService";
import { User } from "@/lib/types";
import { dbConfig } from "@/config/dbConfig"; // você precisa definir essa configuração

export const authenticateWithSqlServer = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .input("Username", sql.VarChar, username)
      .input("Password", sql.VarChar, password)
      .execute("usp_AutenticarUsuario");

    const userData = result.recordset[0];

    if (!userData) {
      console.error("Usuário não encontrado ou senha incorreta.");
      return null;
    }

    // Construir objetos de acordo com os tipos
    const dbUser: DbUser = {
      id: userData.user_id,
      username: userData.username,
      password: '', // Não retornamos a senha
      role: userData.role,
      created_at: '' // Opcional, não vem da SP
    };

    const dbPermission: DbPermission = {
      usuario_id: userData.user_id,
      view: userData.view,
      edit: userData.edit,
      delete: userData.delete,
      can_create: userData.can_create
    };

    return mapDbUserToAppUser(dbUser, dbPermission);
  } catch (error) {
    console.error("Erro na autenticação com SQL Server:", error);
    return null;
  }
};
