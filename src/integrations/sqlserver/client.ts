// src/integrations/sqlserver/client.ts
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis de ambiente do ficheiro .env na raiz do projeto

const sqlConfig: sql.config = {
  user: process.env.SQL_USER || "",
  password: process.env.SQL_PASSWORD || "",
  server: process.env.SQL_SERVER || "localhost", // ex: "localhost" ou "your_server.database.windows.net"
  database: process.env.SQL_DATABASE || "",
  options: {
    encrypt: process.env.SQL_ENCRYPT === "true", // Para Azure SQL ou se o servidor exigir SSL
    trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE === "true", // Apenas para desenvolvimento local com certificados auto-assinados
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool;

export const getDbPool = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    try {
      console.log("A tentar conectar ao SQL Server com a configuração:", JSON.stringify({
        ...sqlConfig,
        password: "[REDACTED]" // Não registar a password
      }));
      pool = await new sql.ConnectionPool(sqlConfig).connect();
      console.log("Conectado ao SQL Server com sucesso!");

      pool.on("error", err => {
        console.error("Erro na pool de conexões do SQL Server:", err);
        // Considerar fechar e recriar a pool em certos erros
      });

    } catch (err) {
      console.error("Erro crítico ao conectar ao SQL Server:", err);
      // Se a conexão inicial falhar, a pool não será definida, e futuras tentativas irão tentar reconectar.
      // Dependendo da estratégia, pode querer lançar o erro para parar a aplicação ou lidar com ele de outra forma.
      throw err; 
    }
  }
  return pool;
};

// Função para executar queries de forma segura
export const executeQuery = async (query: string, params?: { name: string, type: any, value: any }[]) => {
  const pool = await getDbPool();
  const request = pool.request();

  if (params) {
    params.forEach(param => {
      request.input(param.name, param.type, param.value);
    });
  }
  return request.query(query);
};


// Opcional: uma função para fechar a pool quando a aplicação encerrar
// Esta função pode ser chamada no encerramento gracioso da sua aplicação.
export const closeDbPool = async (): Promise<void> => {
  if (pool) {
    try {
      await pool.close();
      console.log("Pool de conexões do SQL Server fechada com sucesso.");
    } catch (err) {
      console.error("Erro ao fechar a pool de conexões do SQL Server:", err);
    }
  }
};

// Exemplo de como usar:
// import { getDbPool, executeQuery } from "@/integrations/sqlserver/client";
// 
// async function testConnection() {
//   try {
//     const pool = await getDbPool(); // Garante que a pool está conectada
//     const result = await executeQuery("SELECT 1 AS number");
//     console.log("Resultado da query de teste:", result.recordset);
//   } catch (error) {
//     console.error("Falha no teste de conexão:", error);
//   }
// }
// 
// testConnection();

