
# Como usar o sistema com SQL Server

## 1. Configuração do .env

Edite o arquivo `.env` na raiz do projeto e configure suas credenciais do SQL Server:

```
SQLSERVER_HOST=kauikserver.ddns.net
SQLSERVER_DATABASE=atendimento_recepcao
SQLSERVER_USER=seu_usuario_aqui
SQLSERVER_PASSWORD=sua_senha_aqui
SQLSERVER_PORT=3761
SQLSERVER_ENCRYPT=false
SQLSERVER_TRUST_CERT=true
JWT_SECRET=sua_chave_secreta_super_segura_aqui
VITE_API_URL=http://localhost:3001/api
```

## 2. Instalar dependências

```bash
npm install
```

## 3. Iniciar o servidor

```bash
node start-server.js
```

## 4. Iniciar o frontend (em outro terminal)

```bash
npm run dev
```

## 5. Estrutura das tabelas SQL Server

Certifique-se que as seguintes tabelas existem no seu banco:

```sql
-- Tabela de setores
CREATE TABLE setores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(50) NOT NULL,
    codigo INT NOT NULL
);

-- Inserir setores padrão
INSERT INTO setores (nome, codigo) VALUES 
('RH', 1),
('DISCIPLINA', 2),
('DP', 3),
('PLANEJAMENTO', 4);

-- Tabela de atendimentos
CREATE TABLE atendimentos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    matricula NVARCHAR(20) NOT NULL,
    nome NVARCHAR(100) NOT NULL,
    cargo NVARCHAR(50) NOT NULL,
    setor_id INT NOT NULL,
    motivo NVARCHAR(500) NOT NULL,
    horario DATETIME2 DEFAULT GETDATE(),
    atendido BIT DEFAULT 0,
    atendido_em DATETIME2 NULL,
    FOREIGN KEY (setor_id) REFERENCES setores(id)
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) DEFAULT 'user',
    permissions NVARCHAR(500) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
```

## Troubleshooting

Se o erro "Failed to fetch" persistir:

1. Verifique se o servidor está rodando na porta 3001
2. Confirme as credenciais do SQL Server no arquivo .env
3. Teste a conexão com o SQL Server
4. Verifique se não há firewall bloqueando a porta 3001
