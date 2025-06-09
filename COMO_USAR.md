
# Como usar o sistema com SQL Server

## ⚠️ PASSOS OBRIGATÓRIOS

### 1. Editar o arquivo .env

**IMPORTANTE**: Edite o arquivo `.env` na raiz do projeto e substitua pelos seus dados reais:

```env
SQLSERVER_HOST=kauikserver.ddns.net
SQLSERVER_DATABASE=atendimento_recepcao
SQLSERVER_USER=SEU_USUARIO_REAL_AQUI
SQLSERVER_PASSWORD=SUA_SENHA_REAL_AQUI
SQLSERVER_PORT=3761
SQLSERVER_ENCRYPT=false
SQLSERVER_TRUST_CERT=true
JWT_SECRET=sua_chave_secreta_super_segura_aqui_123456
VITE_API_URL=http://localhost:3001/api
PORT=3001
```

### 2. Instalar dependências (se ainda não instalou)

```bash
npm install
```

### 3. Iniciar o servidor

```bash
node start-server.js
```

**Você deve ver:**
```
🚀 Iniciando servidor SQL Server...
✅ Conectado ao SQL Server com sucesso!
✅ Server running on port 3001
📡 API disponível em: http://localhost:3001
```

### 4. Em outro terminal, iniciar o frontend

```bash
npm run dev
```

## 📋 Estrutura das tabelas SQL Server (OBRIGATÓRIAS)

Execute estes comandos no seu SQL Server Management Studio:

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

## 🔧 Troubleshooting

### Erro "Failed to fetch"
1. **Verifique se o servidor está rodando**: Deve aparecer "Server running on port 3001"
2. **Teste a API diretamente**: Abra http://localhost:3001/health no navegador
3. **Verifique as credenciais**: Certifique-se que SQLSERVER_USER e SQLSERVER_PASSWORD estão corretos

### Erro de conexão SQL Server
1. **Ping no servidor**: `ping kauikserver.ddns.net`
2. **Teste a porta**: `telnet kauikserver.ddns.net 3761`
3. **Verifique firewall**: A porta 3761 deve estar aberta

### Servidor não inicia
1. **Verifique se o Node.js está instalado**: `node --version`
2. **Instale as dependências**: `npm install`
3. **Execute com logs**: `node start-server.js`

## 📞 Status da Conexão

Para verificar se tudo está funcionando:

1. ✅ Servidor rodando: http://localhost:3001/health
2. ✅ Frontend rodando: http://localhost:5173
3. ✅ SQL Server conectado: Logs do servidor devem mostrar "Conectado ao SQL Server com sucesso!"
