
# 🛎️ Sistema de Atendimento de Recepção

Este é um sistema web para controle de atendimentos em recepção, desenvolvido com foco em agilidade, organização e facilidade de uso. O objetivo é permitir o registro rápido de visitantes ou colaboradores, categorizando por setor e motivo, com um painel moderno estilo dashboard e integração com inteligência artificial para melhorar o atendimento.

## 🚀 Funcionalidades

- 📋 **Registro de Atendimentos:** Cadastro de nome, matrícula, cargo, setor, motivo e horário automaticamente preenchido.
- 🧾 **Dashboard Interativo:** Cards com os dados dos atendimentos realizados, com contadores e filtros por data e setor.
- 🧠 **Integração com IA (Lovable):** Suporte a sugestão automática de motivos ou resposta a atendentes com base no histórico e padrão de interações.
- 🕒 **Horário Automático:** O sistema preenche o horário atual no momento do registro.
- 📂 **Persistência de Dados:** Todos os dados ficam salvos em um banco de dados SQLite local.
- ✅ **Interface Responsiva:** Totalmente funcional em desktop e tablets.

## 🧰 Tecnologias Utilizadas

### Frontend
- ⚛️ React com Vite
- 🎨 Tailwind CSS
- 🧩 ShadCN UI Components
- 📊 Recharts para gráficos e visualizações

### Backend
- 🟩 Node.js com Express
- 🗂️ SQLite3 para armazenamento de dados
- 🔒 bcrypt para criptografia de senhas
- 🔄 API RESTful

## 💻 Instalação e Execução

### Pré-requisitos
- Node.js (v14+)
- npm ou yarn

### Passos para execução

1. **Instale as dependências:**

```bash
npm install
# ou
yarn
```

2. **Inicie o backend:**

```bash
node src/server-start.js
```

3. **Em outro terminal, inicie o frontend:**

```bash
npm run dev
# ou
yarn dev
```

4. O frontend estará disponível em `http://localhost:8080` e o backend em `http://localhost:3001`

## Estrutura do Banco de Dados

### Tabela 'usuarios'
- id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- matricula (TEXT, único)
- nome (TEXT)
- cargo (TEXT)
- setor (TEXT)
- senha (TEXT - armazenado com hash bcrypt)

### Tabela 'atendimentos'
- id (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- usuario_id (INTEGER, FOREIGN KEY referenciando usuarios.id)
- horario (DATETIME)
- setor (TEXT)
- motivo (TEXT)
- attended (BOOLEAN)
- attendedAt (DATETIME)

## API Endpoints

### Usuários
- `GET /api/usuarios` - Listar todos os usuários
- `GET /api/usuarios/:id` - Obter usuário por ID
- `POST /api/usuarios` - Criar novo usuário
- `POST /api/usuarios/login` - Autenticar usuário

### Atendimentos
- `GET /api/atendimentos` - Listar atendimentos (suporta filtros por data, setor e status)
- `GET /api/atendimentos/:id` - Obter atendimento por ID
- `POST /api/atendimentos` - Registrar novo atendimento
- `PATCH /api/atendimentos/:id/attend` - Marcar atendimento como atendido
