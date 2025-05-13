import sql from 'mssql';
import { dbConfig } from './dbConfig';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Configuração do JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '8h';

// Serviço de autenticação
export const authService = {
  /**
   * Autentica um usuário com SQL Server
   * @param username Nome de usuário
   * @param password Senha
   * @returns Promise<User | null>
   */
  authenticateWithSQLServer: async (username: string, password: string): Promise<any | null> => {
    try {
      const pool = await sql.connect(dbConfig);
      
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .query('SELECT * FROM Users WHERE username = @username');
      
      await pool.close();
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const user = result.recordset[0];
      
      // Verificar senha
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return null;
      }
      
      // Gerar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: JSON.parse(user.permissions || '{}'),
        token
      };
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return null;
    }
  }
};

// Serviço de gerenciamento de usuários
export const userService = {
  /**
   * Cria um novo usuário no SQL Server
   * @param username Nome de usuário
   * @param password Senha
   * @param role Perfil do usuário
   * @param permissions Permissões
   * @returns Promise<User | null>
   */
  createUserInSQLServer: async (
    username: string, 
    password: string, 
    role: string, 
    permissions: Record<string, boolean>
  ): Promise<any | null> => {
    try {
      const pool = await sql.connect(dbConfig);
      
      // Verificar se usuário já existe
      const userExists = await pool.request()
        .input('username', sql.NVarChar, username)
        .query('SELECT 1 FROM Users WHERE username = @username');
      
      if (userExists.recordset.length > 0) {
        throw new Error('Usuário já existe');
      }
      
      // Hash da senha
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Inserir novo usuário
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .input('password_hash', sql.NVarChar, passwordHash)
        .input('role', sql.NVarChar, role)
        .input('permissions', sql.NVarChar, JSON.stringify(permissions))
        .query(`
          INSERT INTO Users (username, password_hash, role, permissions)
          OUTPUT INSERTED.id, INSERTED.username, INSERTED.role, INSERTED.permissions
          VALUES (@username, @password_hash, @role, @permissions)
        `);
      
      await pool.close();
      
      if (result.recordset.length === 0) {
        throw new Error('Falha ao criar usuário');
      }
      
      const newUser = result.recordset[0];
      return {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        permissions: JSON.parse(newUser.permissions || '{}')
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  /**
   * Obtém todos os usuários do SQL Server
   * @returns Promise<User[]>
   */
  getAllUsers: async (): Promise<any[]> => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .query('SELECT id, username, role, permissions FROM Users');
      
      await pool.close();
      
      return result.recordset.map(user => ({
        ...user,
        permissions: JSON.parse(user.permissions || '{}')
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  /**
   * Obtém um usuário pelo ID
   * @param id ID do usuário
   * @returns Promise<User | null>
   */
  getUserById: async (id: number): Promise<any | null> => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, username, role, permissions FROM Users WHERE id = @id');
      
      await pool.close();
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const user = result.recordset[0];
      return {
        ...user,
        permissions: JSON.parse(user.permissions || '{}')
      };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }
};

// Para compatibilidade com código existente (aliases)
export const getUsersFromSQLServer = userService.getAllUsers;
export const { authenticateWithSQLServer, createUserInSQLServer } = authService;

// Função para criar tabela de usuários (executar uma vez)
export const createUsersTable = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) NOT NULL,
        permissions NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2
      )
    `);
    
    await pool.close();
    console.log('Tabela Users verificada/criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela Users:', error);
  }
};