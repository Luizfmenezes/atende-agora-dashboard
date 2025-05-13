import sql from 'mssql';
import { dbConfig } from './dbConfig';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type User = {
  id: string;
  username: string;
  role: UserRole;
  permissions: Permission;
};

type Permission = {
  [key: string]: boolean;
};

type UserRole = 'admin' | 'manager' | 'user';

// Configuração do JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '8h';

export const authenticate = async (username: string, password: string): Promise<User | null> => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT 
          id,
          username,
          password_hash,
          role,
          permissions
        FROM 
          Users
        WHERE 
          username = @username
      `);
    
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
    
    // Retornar usuário sem a senha
    return {
      id: user.id.toString(),
      username: user.username,
      role: user.role,
      permissions: JSON.parse(user.permissions || '{}')
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
};

export const createUser = async (
  username: string, 
  password: string, 
  role: UserRole, 
  permissions: Permission
): Promise<User | null> => {
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
      id: newUser.id.toString(),
      username: newUser.username,
      role: newUser.role,
      permissions: JSON.parse(newUser.permissions || '{}')
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

export const validatePermission = (user: User | null, permission: keyof Permission): boolean => {
  if (!user) return false;
  
  // Administradores sempre têm todas as permissões
  if (user.role === "admin") return true;
  
  // Verificar permissão específica
  return user.permissions[permission] || false;
};

export const getUserDisplayName = (user: User): string => {
  return user.username;
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin";
};

// Funções adicionais úteis para autenticação JWT
export const generateAuthToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyAuthToken = (token: string): User | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      permissions: decoded.permissions || {}
    };
  } catch (error) {
    return null;
  }
};

// Criar tabela de usuários (executar uma vez)
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
        created_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    await pool.close();
    console.log('Tabela Users verificada/criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela Users:', error);
  }
};