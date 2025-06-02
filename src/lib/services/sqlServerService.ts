
import { Attendance, User, Permission, UserRole } from "@/lib/types";
import { API_CONFIG } from "@/lib/config/database";

// Helper function for API requests
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
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

// Serviço de autenticação
export const authService = {
  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const response = await fetchAPI<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      if (response.user) {
        // Armazenar token se necessário
        localStorage.setItem('auth_token', response.token);
        return response.user;
      }
      
      return null;
    } catch (error) {
      console.error("Erro na autenticação:", error);
      return null;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  }
};

// Serviço de usuários
export const userService = {
  async createUser(
    username: string, 
    password: string, 
    role: UserRole, 
    permissions: Permission
  ): Promise<User | null> {
    try {
      const response = await fetchAPI<User>('/users', {
        method: 'POST',
        body: JSON.stringify({ username, password, role, permissions }),
      });
      return response;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetchAPI<User[]>('/users');
      return response;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return [];
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetchAPI<User>(`/users/${id}`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      return null;
    }
  }
};

// Serviço de atendimentos
export const attendanceService = {
  async getAllAttendances(filters?: {
    startDate?: string;
    endDate?: string;
    sector?: string;
    status?: 'attended' | 'waiting';
  }): Promise<Attendance[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.startDate) queryParams.append("startDate", filters.startDate);
      if (filters?.endDate) queryParams.append("endDate", filters.endDate);
      if (filters?.sector && filters.sector !== "all") queryParams.append("sector", filters.sector);
      if (filters?.status && filters.status !== "all") queryParams.append("status", filters.status);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetchAPI<any[]>(`/attendances${query}`);
      
      // Mapear dados para o formato da aplicação
      return response.map(this.mapToAttendanceModel);
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
      return [];
    }
  },

  async createAttendance(data: {
    registration: string;
    name: string;
    position: string;
    sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO";
    reason: string;
  }): Promise<Attendance> {
    try {
      const response = await fetchAPI<any>('/attendances', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return this.mapToAttendanceModel(response);
    } catch (error) {
      console.error("Erro ao criar atendimento:", error);
      throw error;
    }
  },

  async markAsAttended(id: string): Promise<boolean> {
    try {
      await fetchAPI(`/attendances/${id}/attend`, {
        method: 'PATCH',
      });
      return true;
    } catch (error) {
      console.error(`Erro ao marcar atendimento ${id} como atendido:`, error);
      return false;
    }
  },

  async deleteAttendance(id: string): Promise<boolean> {
    try {
      await fetchAPI(`/attendances/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Erro ao excluir atendimento ${id}:`, error);
      return false;
    }
  },

  mapToAttendanceModel(sqlServerData: any): Attendance {
    return {
      id: String(sqlServerData.id),
      registration: sqlServerData.matricula || sqlServerData.registration,
      name: sqlServerData.nome || sqlServerData.name,
      position: sqlServerData.cargo || sqlServerData.position,
      sector: sqlServerData.setor || sqlServerData.sector,
      reason: sqlServerData.motivo || sqlServerData.reason,
      createdAt: sqlServerData.horario || sqlServerData.createdAt,
      attended: sqlServerData.atendido || sqlServerData.attended || false,
      attendedAt: sqlServerData.atendido_em || sqlServerData.attendedAt,
      hideAfter: sqlServerData.attended ? 40 : undefined,
    };
  }
};

// Serviço de setores
export const sectorService = {
  async getAllSectors(): Promise<{ id: number; nome: string; codigo: number }[]> {
    try {
      const response = await fetchAPI<{ id: number; nome: string; codigo: number }[]>('/sectors');
      return response;
    } catch (error) {
      console.error("Erro ao buscar setores:", error);
      return [];
    }
  },

  async getSectorByName(name: string): Promise<{ id: number; nome: string; codigo: number } | null> {
    try {
      const sectors = await this.getAllSectors();
      return sectors.find(sector => sector.nome.toLowerCase() === name.toLowerCase()) || null;
    } catch (error) {
      console.error(`Erro ao buscar setor ${name}:`, error);
      return null;
    }
  }
};
