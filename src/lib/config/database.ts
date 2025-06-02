
// Configuração do banco de dados SQL Server
export const DATABASE_CONFIG = {
  server: process.env.SQLSERVER_HOST || 'localhost',
  database: process.env.SQLSERVER_DATABASE || 'atendimento_recepcao',
  user: process.env.SQLSERVER_USER || 'sa',
  password: process.env.SQLSERVER_PASSWORD || '',
  port: parseInt(process.env.SQLSERVER_PORT || '1433'),
  options: {
    encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQLSERVER_TRUST_CERT === 'true'
  }
};

// URLs da API
export const API_CONFIG = {
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001/api',
  endpoints: {
    auth: '/auth',
    users: '/users',
    attendances: '/attendances',
    sectors: '/sectors'
  }
};
