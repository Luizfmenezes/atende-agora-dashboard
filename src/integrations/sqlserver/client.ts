// src/integrations/sqlserver/client.ts
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config(); // Carrega variáveis de ambiente do ficheiro .env

const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER, // ex: 'localhost' ou 'your_server.database.windows.net'
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true', // Para Azure SQL ou se o servidor exigir SSL
    trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE === 'true' // Apenas para desenvolvimento local
  }
};

let pool: sql.ConnectionPool;

export const getDbPool = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    try {
      pool = await sql.connect(sqlConfig);
      console.log('Conectado ao SQL Server com sucesso!');
    } catch (err) {
      console.error('Erro ao conectar ao SQL Server:', err);
      throw err; // Re-lança o erro para que a aplicação saiba que a conexão falhou
    }
  }
  return pool;
};

// Opcional: uma função para fechar a pool quando a aplicação encerrar
export const closeDbPool = async (): Promise<void> => {
  if (pool) {
    await pool.close();
    console.log('Pool de conexões do SQL Server fechada.');
  }
};

// Exemplo de como usar:
// import { getDbPool } from '@/integrations/sqlserver/client';
// const pool = await getDbPool();
// const result = await pool.request().query('SELECT 1 AS number');
// console.log(result.recordset);
