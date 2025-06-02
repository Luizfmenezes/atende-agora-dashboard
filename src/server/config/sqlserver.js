
const sql = require('mssql');
require('dotenv').config();

// Configuração do SQL Server
const config = {
  server: process.env.SQLSERVER_HOST || 'localhost',
  database: process.env.SQLSERVER_DATABASE || 'atendimento_recepcao',
  user: process.env.SQLSERVER_USER || 'sa',
  password: process.env.SQLSERVER_PASSWORD || '',
  port: parseInt(process.env.SQLSERVER_PORT || '1433'),
  options: {
    encrypt: process.env.SQLSERVER_ENCRYPT === 'true', // Use true para Azure
    trustServerCertificate: process.env.SQLSERVER_TRUST_CERT === 'true' // Use true para desenvolvimento local
  }
};

let pool;

// Inicializar pool de conexões
const initializeDatabase = async () => {
  try {
    pool = await sql.connect(config);
    console.log('Conectado ao SQL Server com sucesso!');
    return pool;
  } catch (error) {
    console.error('Erro ao conectar com SQL Server:', error);
    throw error;
  }
};

// Obter pool de conexões
const getPool = () => {
  if (!pool) {
    throw new Error('Pool de conexões não inicializado. Chame initializeDatabase() primeiro.');
  }
  return pool;
};

// Fechar conexões
const closeDatabase = async () => {
  try {
    if (pool) {
      await pool.close();
      console.log('Conexões do SQL Server fechadas.');
    }
  } catch (error) {
    console.error('Erro ao fechar conexões:', error);
  }
};

module.exports = {
  sql,
  config,
  initializeDatabase,
  getPool,
  closeDatabase
};
