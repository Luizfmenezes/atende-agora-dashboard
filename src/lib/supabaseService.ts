
import { supabase } from "@/integrations/supabase/client";
import { Attendance } from "@/lib/types";

// Tipos para as tabelas do Supabase
export interface SupabaseUser {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
}

export interface SupabaseSector {
  id: number;
  nome: string;
  codigo: number;
}

export interface SupabaseAttendance {
  id: number;
  matricula: string;
  nome: string;
  cargo: string;
  horario: string;
  setor_id: number;
  motivo: string;
  usuario_id: number | null;
  atendido: boolean;
  atendido_em: string | null;
}

// Serviço para operações com setores
export const sectorService = {
  // Buscar todos os setores
  async getAllSectors(): Promise<SupabaseSector[]> {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error("Erro ao buscar setores:", error);
      throw error;
    }
    
    return data || [];
  },
  
  // Buscar setor por ID
  async getSectorById(id: number): Promise<SupabaseSector | null> {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar setor ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  // Buscar setor por nome
  async getSectorByName(name: string): Promise<SupabaseSector | null> {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .ilike('nome', name)
      .maybeSingle();
    
    if (error) {
      console.error(`Erro ao buscar setor ${name}:`, error);
      return null;
    }
    
    return data;
  }
};

// Serviço para operações com funcionários
export const employeeService = {
  // Buscar todos os funcionários
  async getAllEmployees(): Promise<SupabaseUser[]> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw error;
    }
    
    return data || [];
  },
  
  // Buscar funcionário por matrícula
  async getEmployeeByRegistration(registration: string): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('matricula', registration)
      .maybeSingle();
    
    if (error) {
      console.error(`Erro ao buscar funcionário com matrícula ${registration}:`, error);
      return null;
    }
    
    return data;
  },
  
  // Criar novo funcionário
  async createEmployee(employee: {
    matricula: string;
    nome: string;
    cargo: string;
  }): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('funcionarios')
      .insert([employee])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar funcionário:", error);
      throw error;
    }
    
    return data;
  }
};

// Serviço para operações com atendimentos
export const attendanceService = {
  // Buscar todos os atendimentos (com filtros opcionais)
  async getAllAttendances(filters?: {
    startDate?: string;
    endDate?: string;
    sector?: number | string;
    status?: 'attended' | 'waiting';
  }): Promise<SupabaseAttendance[]> {
    let query = supabase
      .from('atendimentos')
      .select(`
        *,
        setores(nome, codigo)
      `);
    
    // Aplicar filtros
    if (filters?.startDate) {
      query = query.gte('horario', filters.startDate);
    }
    
    if (filters?.endDate) {
      query = query.lte('horario', filters.endDate);
    }
    
    // Filtrar por setor (pode ser ID ou nome)
    if (filters?.sector) {
      if (typeof filters.sector === 'number') {
        query = query.eq('setor_id', filters.sector);
      } else if (typeof filters.sector === 'string') {
        // Primeiro precisamos encontrar o ID do setor pelo nome
        const sector = await sectorService.getSectorByName(filters.sector);
        if (sector) {
          query = query.eq('setor_id', sector.id);
        }
      }
    }
    
    // Ordenar por data (mais recentes primeiro)
    query = query.order('horario', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Erro ao buscar atendimentos:", error);
      throw error;
    }
    
    return data || [];
  },
  
  // Buscar atendimento por ID
  async getAttendanceById(id: number): Promise<SupabaseAttendance | null> {
    const { data, error } = await supabase
      .from('atendimentos')
      .select(`
        *,
        setores(nome, codigo)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erro ao buscar atendimento ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  // Criar novo atendimento
  async createAttendance(attendance: {
    matricula: string;
    nome: string;
    cargo: string;
    setor_id: number;
    motivo: string;
    usuario_id?: number;
  }): Promise<SupabaseAttendance | null> {
    const { data, error } = await supabase
      .from('atendimentos')
      .insert([attendance])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar atendimento:", error);
      throw error;
    }
    
    return data;
  },
  
  // Marcar atendimento como atendido
  async markAsAttended(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('atendimentos')
      .update({
        atendido: true,
        atendido_em: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao marcar atendimento ${id} como atendido:`, error);
      return false;
    }
    
    return true;
  },
  
  // Excluir atendimento
  async deleteAttendance(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('atendimentos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erro ao excluir atendimento ${id}:`, error);
      return false;
    }
    
    return true;
  },
  
  // Converter atendimentos do Supabase para o formato da aplicação
  mapToAttendanceModel(supabaseAttendance: any): Attendance {
    return {
      id: String(supabaseAttendance.id),
      registration: supabaseAttendance.matricula,
      name: supabaseAttendance.nome,
      position: supabaseAttendance.cargo,
      sector: supabaseAttendance.setores?.nome || "DESCONHECIDO",
      reason: supabaseAttendance.motivo,
      createdAt: supabaseAttendance.horario,
      attended: supabaseAttendance.atendido || false,
      attendedAt: supabaseAttendance.atendido_em || undefined,
      hideAfter: supabaseAttendance.atendido ? 40 : undefined,
    };
  }
};
