import sql from 'mssql';

// Configuração da conexão com SQL Server
const config = {
  user: 'seu_usuario',
  password: 'sua_senha',
  server: 'localhost',
  database: 'seu_banco',
  options: {
    encrypt: true, // obrigatório no Azure
    trustServerCertificate: true // necessário para conexões locais
  }
};

// Função para inicializar o banco de dados
const initDb = async () => {
  try {
    const pool = await sql.connect(config);

    // Criar tabela usuarios
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usuarios' AND xtype='U')
      CREATE TABLE usuarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        matricula NVARCHAR(50) UNIQUE,
        nome NVARCHAR(100),
        cargo NVARCHAR(100),
        setor NVARCHAR(100),
        senha NVARCHAR(100)
      )
    `);

    // Criar tabela atendimentos
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='atendimentos' AND xtype='U')
      CREATE TABLE atendimentos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT,
        horario DATETIME DEFAULT GETDATE(),
        setor NVARCHAR(100),
        motivo NVARCHAR(255),
        attended BIT DEFAULT 0,
        attendedAt DATETIME,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    console.log('Banco de dados SQL Server inicializado com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
};

initDb();

export default sql;