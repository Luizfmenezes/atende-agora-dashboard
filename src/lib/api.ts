
import { Attendance, User } from "./types";

const API_URL = "http://localhost:3001/api";

// Helper function for API requests
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Erro desconhecido",
    }));
    throw new Error(error.error || "Erro na requisição");
  }

  return response.json();
}

// Attendance API functions
export const attendanceAPI = {
  getAll: (filters?: {
    startDate?: string;
    endDate?: string;
    sector?: string;
    status?: "attended" | "waiting" | "all";
  }) => {
    const queryParams = new URLSearchParams();
    
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.sector && filters.sector !== "all") queryParams.append("sector", filters.sector);
    if (filters?.status && filters.status !== "all") queryParams.append("status", filters.status);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return fetchAPI<Attendance[]>(`/atendimentos${query}`);
  },
  
  getById: (id: string) => fetchAPI<Attendance>(`/atendimentos/${id}`),
  
  create: (data: {
    usuario_id: string;
    setor: string;
    motivo: string;
  }) => fetchAPI<Attendance>("/atendimentos", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  
  markAsAttended: (id: string) => 
    fetchAPI<Attendance>(`/atendimentos/${id}/attend`, {
      method: "PATCH",
    }),
};

// User API functions
export const userAPI = {
  getAll: () => fetchAPI<User[]>("/usuarios"),
  
  getById: (id: string) => fetchAPI<User>(`/usuarios/${id}`),
  
  create: (data: {
    matricula: string;
    nome: string;
    cargo: string;
    setor: string;
    senha: string;
  }) => fetchAPI<User>("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  
  login: (matricula: string, senha: string) => 
    fetchAPI<User>("/usuarios/login", {
      method: "POST",
      body: JSON.stringify({ matricula, senha }),
    }),
};
