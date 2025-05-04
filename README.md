# 🛎️ Sistema de Atendimento de Recepção

Este é um sistema web para controle de atendimentos em recepção, desenvolvido com foco em agilidade, organização e facilidade de uso. O objetivo é permitir o registro rápido de visitantes ou colaboradores, categorizando por setor e motivo, com um painel moderno estilo dashboard e integração com inteligência artificial para melhorar o atendimento.

## 🚀 Funcionalidades

- 📋 **Registro de Atendimentos:** Cadastro de nome, matrícula, cargo, setor, motivo e horário automaticamente preenchido.
- 🧾 **Dashboard Interativo:** Cards com os dados dos atendimentos realizados, com contadores e filtros por data e setor.
- 🧠 **Integração com IA (Lovable):** Suporte a sugestão automática de motivos ou resposta a atendentes com base no histórico e padrão de interações.
- 🕒 **Horário Automático:** O sistema preenche o horário atual no momento do registro.
- 📂 **Persistência de Dados:** Todos os dados ficam salvos em um banco de dados SQLite local.
- ✅ **Interface Responsiva:** Totalmente funcional em desktop e tablets.

---

## 🧰 Tecnologias Utilizadas

### 🟨 Vite
Usado como bundler e servidor de desenvolvimento ultrarrápido. Garante recarregamento rápido e build eficiente para aplicações modernas em React.

### ⚛️ React
Framework principal para a criação da interface de usuário. Utilizado com componentes reutilizáveis, estado local e reatividade.

### 🌐 HTML5 + CSS3
A base estrutural e visual do sistema. Usado em conjunto com Tailwind CSS para um design limpo, moderno e responsivo.

### 🟨 JavaScript (ES6+)
Linguagem principal da aplicação, utilizada tanto no frontend quanto no backend, com recursos modernos de ES6+.

### 🟩 Node.js
Ambiente de execução para o backend da aplicação, responsável pela comunicação com o banco de dados e gerenciamento dos registros.

### 🗂️ SQLite
Banco de dados leve, sem servidor, utilizado para armazenar os atendimentos de forma simples e eficiente.

### 🤖 Lovable IA
Integração com a inteligência artificial **Lovable**, responsável por:
- Sugerir motivos de atendimento com base no conteúdo digitado.
- Ajudar na triagem automatizada com base em dados anteriores.
- Enriquecer o atendimento com sugestões inteligentes.

---

## 💻 Instalação e Execução

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/atendimento-recepcao.git
cd atendimento-recepcao
