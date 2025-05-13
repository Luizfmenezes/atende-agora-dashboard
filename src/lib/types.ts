// Tipos de usuário e permissões
export type UserRole = "admin" | "user" | "manager"; // Adicionei 'manager' como exemplo de role adicional

export interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
  create: boolean;
  // Podem ser adicionadas mais permissões conforme necessário
}

export interface User {
  id: string;           // UUID ou ID numérico convertido para string
  username: string;     // Nome de usuário único
  role: UserRole;       // Papel do usuário
  permissions: Permission; // Permissões específicas
  createdAt?: Date;     // Data de criação (opcional)
  updatedAt?: Date;     // Data de atualização (opcional)
}

// Tipos para atendimentos
export type Sector = "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO";

export interface Attendance {
  id: string;                   // ID do atendimento
  registration: string;         // Matrícula do solicitante
  name: string;                 // Nome do solicitante
  position: string;             // Cargo/função
  sector: Sector;               // Setor de atendimento
  reason: string;               // Motivo do atendimento
  createdAt: Date | string;     // Data/hora de criação
  attended: boolean;            // Se foi atendido
  attendedAt?: Date | string;   // Data/hora do atendimento
  hideAfter?: number;           // Tempo para ocultar após atendimento (em segundos)
  userId?: string;              // ID do usuário que registrou (opcional)
}

// Estatísticas do dashboard
export interface DashboardStats {
  waiting: number;     // Quantidade aguardando atendimento
  attended: number;    // Quantidade atendida
  remaining: number;   // Quantidade restante (pode ser igual a waiting)
  // Podem ser adicionadas mais métricas
}

// Números de WhatsApp por setor
export interface SectorWhatsAppNumber {
  id: string;           // ID do número
  phoneNumber: string;  // Número de telefone
  description?: string; // Descrição/identificação (opcional)
  isActive?: boolean;   // Se está ativo (opcional)
}

export interface SectorWhatsApp {
  sector: Sector;                 // Setor relacionado
  phoneNumbers: SectorWhatsAppNumber[]; // Lista de números
  businessHours?: string;         // Horário de atendimento (opcional)
}

// Tipos adicionais para integração com SQL Server
export interface DatabaseSector {
  id: number;
  name: Sector;
  code?: string;
  whatsappNumbers?: string; // JSON string com os números
  createdAt: Date;
}

export interface DatabaseUser {
  id: number;
  username: string;
  passwordHash: string;
  role: UserRole;
  permissions: string; // JSON string
  createdAt: Date;
  updatedAt?: Date;
}

export interface DatabaseAttendance {
  id: number;
  registration: string;
  name: string;
  position: string;
  sector_id: number;
  reason: string;
  created_at: Date;
  attended: boolean;
  attended_at?: Date;
  hide_after?: number;
  user_id?: number;
}

// Tipos para operações do banco de dados
export interface QueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rowsAffected?: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}