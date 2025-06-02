
# Configuração do SQL Server para o Sistema de Atendimento

## Scripts para criar o banco de dados e tabelas

Execute estes scripts no seu SQL Server Management Studio ou Azure Data Studio:

### 1. Criar o banco de dados
```sql
CREATE DATABASE atendimento_recepcao;
GO

USE atendimento_recepcao;
GO
```

### 2. Criar tabela de setores
```sql
CREATE TABLE setores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(100) NOT NULL,
    codigo INT NOT NULL UNIQUE
);

-- Inserir setores padrão
INSERT INTO setores (nome, codigo) VALUES 
('RH', 1),
('DISCIPLINA', 2),
('DP', 3),
('PLANEJAMENTO', 4);
```

### 3. Criar tabela de usuários
```sql
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    created_at DATETIME2 DEFAULT GETDATE()
);
```

### 4. Criar tabela de permissões
```sql
CREATE TABLE permissoes (
    usuario_id INT PRIMARY KEY,
    view_permission BIT NOT NULL DEFAULT 1,
    edit_permission BIT NOT NULL DEFAULT 0,
    delete_permission BIT NOT NULL DEFAULT 0,
    create_permission BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

### 5. Criar tabela de funcionários
```sql
CREATE TABLE funcionarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    matricula NVARCHAR(20) NOT NULL UNIQUE,
    nome NVARCHAR(200) NOT NULL,
    cargo NVARCHAR(100) NOT NULL
);
```

### 6. Criar tabela de atendimentos
```sql
CREATE TABLE atendimentos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    matricula NVARCHAR(20) NOT NULL,
    nome NVARCHAR(200) NOT NULL,
    cargo NVARCHAR(100) NOT NULL,
    setor_id INT NOT NULL,
    motivo NVARCHAR(500) NOT NULL,
    horario DATETIME2 NOT NULL DEFAULT GETDATE(),
    atendido BIT NOT NULL DEFAULT 0,
    atendido_em DATETIME2 NULL,
    usuario_id INT NULL,
    FOREIGN KEY (setor_id) REFERENCES setores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### 7. Criar usuário administrador padrão
```sql
-- Senha: admin123 (hash bcrypt)
INSERT INTO usuarios (username, password, role) 
VALUES ('admin', '$2b$10$rKpCWvJzEf1lQgJ9HZGQOu3BvBKKKHlKOVzTGfJkMzE1QkjZfyG1i', 'admin');

-- Inserir permissões para o admin
INSERT INTO permissoes (usuario_id, view_permission, edit_permission, delete_permission, create_permission)
VALUES (1, 1, 1, 1, 1);
```

### 8. Criar índices para performance
```sql
CREATE INDEX IX_atendimentos_horario ON atendimentos(horario);
CREATE INDEX IX_atendimentos_setor_id ON atendimentos(setor_id);
CREATE INDEX IX_atendimentos_atendido ON atendimentos(atendido);
CREATE INDEX IX_usuarios_username ON usuarios(username);
```

## Configuração da aplicação

### 1. Instalar dependências do SQL Server
```bash
npm install mssql jsonwebtoken bcrypt dotenv
```

### 2. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure:

```env
SQLSERVER_HOST=localhost
SQLSERVER_DATABASE=atendimento_recepcao
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=SuaSenhaAqui123!
SQLSERVER_PORT=1433
SQLSERVER_ENCRYPT=false
SQLSERVER_TRUST_CERT=true
JWT_SECRET=sua_chave_secreta_super_segura_aqui
VITE_API_URL=http://localhost:3001/api
```

### 3. Para Azure SQL Database
Se estiver usando Azure SQL Database, configure:
```env
SQLSERVER_HOST=seu-servidor.database.windows.net
SQLSERVER_ENCRYPT=true
SQLSERVER_TRUST_CERT=false
```

## Credenciais padrão para login
- **Usuário:** admin
- **Senha:** admin123

## Testando a conexão

1. Inicie o servidor backend:
```bash
npm run dev
```

2. Teste a API:
```bash
curl http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Estrutura das tabelas

- **usuarios**: Armazena usuários do sistema
- **permissoes**: Define permissões por usuário
- **setores**: Lista dos setores disponíveis
- **funcionarios**: Cadastro de funcionários (opcional)
- **atendimentos**: Registros de atendimento na recepção

## Próximos passos

1. Execute os scripts SQL no seu servidor
2. Configure as variáveis de ambiente
3. Instale as dependências
4. Inicie o servidor backend
5. Teste o login com as credenciais padrão

O sistema estará pronto para uso após estes passos!
```
