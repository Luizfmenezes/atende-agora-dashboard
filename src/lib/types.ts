
export type UserRole = "admin" | "user";

export interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
  create: boolean;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  permissions: Permission;
}

export interface Attendance {
  id: string;
  registration: string;
  name: string;
  position: string;
  sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO";
  reason: string;
  createdAt: string;
  attended: boolean;
  attendedAt?: string;
  hideAfter?: number;
}

export interface DashboardStats {
  waiting: number;
  attended: number;
  remaining: number;
}

export interface SectorWhatsApp {
  sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO";
  phoneNumber: string;
}
