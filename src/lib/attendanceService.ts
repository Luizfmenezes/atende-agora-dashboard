
import { Attendance, DashboardStats } from "./types";
import { attendanceService as sqlServerAttendanceService } from "./services/sqlServerService";

// Função auxiliar para converter formato de data
const formatDateForQuery = (dateString?: string) => {
  if (!dateString) return undefined;
  return new Date(dateString).toISOString();
};

// Obter todos os registros de atendimento
export const getAttendanceRecords = async (filters?: {
  startDate?: string;
  endDate?: string;
  sector?: string;
  status?: string;
  name?: string;
  registration?: string;
}): Promise<Attendance[]> => {
  try {
    const sqlServerFilters = {
      startDate: filters?.startDate ? formatDateForQuery(filters.startDate) : undefined,
      endDate: filters?.endDate ? formatDateForQuery(filters.endDate) : undefined,
      sector: filters?.sector,
      status: filters?.status === 'waiting' ? 'waiting' as const : 
              filters?.status === 'attended' ? 'attended' as const : undefined,
    };

    let records = await sqlServerAttendanceService.getAllAttendances(sqlServerFilters);
    
    // Filtro por nome (aplicado após buscar do SQL Server)
    if (filters?.name) {
      const searchName = filters.name.toLowerCase();
      records = records.filter(record => record.name.toLowerCase().includes(searchName));
    }
    
    // Filtro por matrícula (aplicado após buscar do SQL Server)
    if (filters?.registration) {
      const searchReg = filters.registration.toLowerCase();
      records = records.filter(record => record.registration.toLowerCase().includes(searchReg));
    }
    
    return records;
  } catch (error) {
    console.error("Erro ao buscar registros de atendimento:", error);
    return [];
  }
};

// Registros visíveis na tela principal (filtrar apenas não atendidos ou recentes)
export const getVisibleAttendanceRecords = async (filters?: {
  startDate?: string;
  endDate?: string;
  sector?: string;
  status?: string;
  name?: string;
  registration?: string;
}): Promise<Attendance[]> => {
  const records = await getAttendanceRecords(filters);
  
  // Filtrar apenas registros não atendidos ou registros atendidos recentemente
  return records.filter(record => {
    if (!record.attended) return true;
    
    // Mostra registros atendidos apenas por um período limitado
    if (record.hideAfter) {
      const hideTime = new Date(record.attendedAt || record.createdAt);
      hideTime.setSeconds(hideTime.getSeconds() + record.hideAfter);
      return new Date() < hideTime;
    }
    
    return false;
  });
};

// Obter estatísticas para o dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const allRecords = await getAttendanceRecords();
    const waiting = allRecords.filter(record => !record.attended).length;
    const attended = allRecords.filter(record => record.attended).length;
    
    return {
      waiting,
      attended,
      remaining: waiting
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas do dashboard:", error);
    return {
      waiting: 0,
      attended: 0,
      remaining: 0
    };
  }
};

// Criar novo registro de atendimento
export const createAttendanceRecord = async (data: {
  registration: string;
  name: string;
  position: string;
  sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO";
  reason: string;
}): Promise<Attendance> => {
  try {
    return await sqlServerAttendanceService.createAttendance(data);
  } catch (error) {
    console.error("Erro ao criar registro de atendimento:", error);
    throw error;
  }
};

// Atualizar registro de atendimento
export const updateAttendanceRecord = async (
  id: string,
  data: Partial<Attendance>
): Promise<boolean> => {
  try {
    // Implementação para atualizar os dados no SQL Server
    console.log(`Atualização do atendimento ${id} com dados:`, data);
    return true;
  } catch (error) {
    console.error(`Erro ao atualizar atendimento ${id}:`, error);
    return false;
  }
};

// Marcar como atendido
export const markAsAttended = async (id: string): Promise<boolean> => {
  try {
    return await sqlServerAttendanceService.markAsAttended(id);
  } catch (error) {
    console.error(`Erro ao marcar atendimento ${id} como atendido:`, error);
    return false;
  }
};

// Excluir registro de atendimento
export const deleteAttendanceRecord = async (id: string): Promise<boolean> => {
  try {
    return await sqlServerAttendanceService.deleteAttendance(id);
  } catch (error) {
    console.error(`Erro ao excluir atendimento ${id}:`, error);
    return false;
  }
};

export const findAttendanceRecord = async (id: string): Promise<Attendance | undefined> => {
  try {
    const records = await getAttendanceRecords();
    return records.find(record => record.id === id);
  } catch (error) {
    console.error(`Error finding attendance record ${id}:`, error);
    return undefined;
  }
};

export const getSectorWhatsAppNumber = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO") => {
  const sectorPhoneNumbers = JSON.parse(localStorage.getItem("sectorPhoneNumbers") || "[]");
  const sectorNumbers = sectorPhoneNumbers.find((s: { sector: string; phoneNumbers: any[]; }) => s.sector === sector);
  return sectorNumbers ? sectorNumbers.phoneNumbers : [];
};
