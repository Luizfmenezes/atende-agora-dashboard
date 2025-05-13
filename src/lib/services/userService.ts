import sql from "mssql";
import { User } from "./types";
import { dbConfig } from "@/config/dbConfig";

// Buscar todos os usuários
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM usuarios");
    return result.recordset;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};

// Buscar usuário por ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Id", sql.Int, parseInt(id))
      .query("SELECT * FROM usuarios WHERE id = @Id");

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
};

// Criar novo usuário
export const createUser = async (data: {
  matricula: string;
  nome: string;
  cargo: string;
  setor: string;
  senha: string;
}): Promise<User | null> => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Matricula", sql.VarChar, data.matricula)
      .input("Nome", sql.VarChar, data.nome)
      .input("Cargo", sql.VarChar, data.cargo)
      .input("Setor", sql.VarChar, data.setor)
      .input("Senha", sql.VarChar, data.senha)
      .query(`
        INSERT INTO usuarios (matricula, nome, cargo, setor, senha)
        OUTPUT INSERTED.*
        VALUES (@Matricula, @Nome, @Cargo, @Setor, @Senha)
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return null;
  }
};

// Login
export const loginUser = async (matricula: string, senha: string): Promise<User | null> => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Matricula", sql.VarChar, matricula)
      .input("Senha", sql.VarChar, senha)
      .query("SELECT * FROM usuarios WHERE matricula = @Matricula AND senha = @Senha");

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return null;
  }
};
