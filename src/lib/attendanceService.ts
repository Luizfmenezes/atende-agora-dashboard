// src/lib/attendanceService.ts
import { Attendance, DashboardStats } from "./types";
// Alterar a importação para o novo serviço SQL Server
import { 
  attendanceService as sqlAttendanceService, 
  sectorService as sqlSectorService,
  // A função de mapeamento agora está no sqlServerService, se precisarmos dela diretamente
  // ou se as funções do sqlAttendanceService já retornarem o tipo `Attendance` da aplicação.
  // Vamos assumir que as funções do sqlAttendanceService já podem retornar o tipo `Attendance`
  // ou que o mapeamento é feito dentro delas ou usando a mapToAppAttendanceModel.
} from "./sqlServerService"; 

// Função auxiliar para converter formato de data (mantida, pois é lógica da aplicação)
const formatDateForQuery = (dateString?: string) => {
  if (!dateString) return undefined;
  // O sqlServerService espera datas ISO string para filtros, então esta conversão é útil.
  return new Date(dateString).toISOString(); 
};

// Obter todos os registros de atendimento
export const getAttendanceRecords = async (filters?: {
  startDate?: string;
  endDate?: string;
  sector?: string; // Pode ser nome ou ID, o sqlServerService.getAllAttendances lida com isso
  status?: string; // "waiting" ou "attended"
  name?: string;
  registration?: string;
}): Promise<Attendance[]> => {
  try {
    const sqlFilters = {
      startDate: filters?.startDate ? formatDateForQuery(filters.startDate) : undefined,
      endDate: filters?.endDate ? formatDateForQuery(filters.endDate) : undefined,
      sector: filters?.sector,
      // O filtro de status era aplicado em memória. Vamos mantê-lo assim por enquanto
      // ou considerar movê-lo para a query SQL no sqlServerService se for mais eficiente.
    };

    // Chama a função do novo serviço SQL Server
    const recordsFromDb = await sqlAttendanceService.getAllAttendances(sqlFilters);
    
    // Mapeando para o formato da aplicação usando a função de mapeamento do sqlServerService
    let mappedRecords = recordsFromDb.map(sqlAttendanceService.mapToAppAttendanceModel);
    
    // Filtros em memória (mantidos do código original)
    if (filters?.name) {
      const searchName = filters.name.toLowerCase();
      mappedRecords = mappedRecords.filter(record => record.name.toLowerCase().includes(searchName));
    }
    
    if (filters?.registration) {
      const searchReg = filters.registration.toLowerCase();
      mappedRecords = mappedRecords.filter(record => record.registration.toLowerCase().includes(searchReg));
    }
    
    if (filters?.status === "waiting") {
      mappedRecords = mappedRecords.filter(record => !record.attended);
    } else if (filters?.status === "attended") {
      mappedRecords = mappedRecords.filter(record => record.attended);
    }
    
    return mappedRecords;
  } catch (error) {
    console.error("Erro ao buscar registros de atendimento (SQL Server):", error);
    // Considerar lançar o erro ou retornar um array vazio dependendo da política de erro da aplicação
    throw error; // ou return [];
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
  
  // Lógica de filtragem para visibilidade (mantida)
  return records.filter(record => {
    if (!record.attended) return true;
    
    if (record.attendedAt) { // Certificar que attendedAt existe
        // A lógica de hideAfter precisa ser definida ou recuperada para o tipo Attendance
        // Supondo que hideAfter (em segundos) é uma propriedade de Attendance
        const hideAfterSeconds = record.hideAfter || 40; // Default se não definido
        const attendedTime = new Date(record.attendedAt);
        const hideTime = new Date(attendedTime.getTime() + hideAfterSeconds * 1000);
        return new Date() < hideTime;
    }
    
    return false;
  });
};

// Obter estatísticas para o dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Considerar otimizar isso com queries SQL agregadas no sqlServerService
    // em vez de buscar todos os registos e filtrar em memória.
    const allRecords = await getAttendanceRecords(); // Usa a função já adaptada
    const waiting = allRecords.filter(record => !record.attended).length;
    const attended = allRecords.filter(record => record.attended).length;
    
    return {
      waiting,
      attended,
      remaining: waiting // Ou outra lógica para "remaining"
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas do dashboard (SQL Server):", error);
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
  sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO"; // Manter este tipo se for usado na UI
  reason: string;
}): Promise<Attendance> => {
  try {
    // Buscar o ID do setor pelo nome usando o novo serviço
    const sectorData = await sqlSectorService.getSectorByName(data.sector);
    
    if (!sectorData) {
      throw new Error(`Setor não encontrado: ${data.sector}`);
    }
    
    // Criar o registro usando o novo serviço SQL Server
    const newAttendanceData = {
      matricula: data.registration,
      nome: data.name,
      cargo: data.position,
      setor_id: sectorData.id, // Usar o ID do setor encontrado
      motivo: data.reason,
      // usuario_id pode ser adicionado aqui se fizer parte do `data` ou contexto
    };
    
    const createdDbRecord = await sqlAttendanceService.createAttendance(newAttendanceData);
    
    if (!createdDbRecord) {
      throw new Error("Erro ao criar atendimento no SQL Server");
    }
    
    // Mapear para o formato da aplicação
    return sqlAttendanceService.mapToAppAttendanceModel(createdDbRecord);
  } catch (error) {
    console.error("Erro ao criar registro de atendimento (SQL Server):", error);
    throw error;
  }
};

// Atualizar registro de atendimento (placeholder mantido, adaptar se necessário)
export const updateAttendanceRecord = async (
  id: string,
  data: Partial<Attendance>
): Promise<boolean> => {
  try {
    // Esta função precisaria ser implementada no sqlServerService.ts
    // e depois chamada aqui. Ex: await sqlAttendanceService.updateAttendance(Number(id), data_adaptada_para_sql);
    console.warn(`Placeholder: Atualização do atendimento ${id} com dados:`, data, "- Implementar no sqlServerService");
    // Por agora, retorna true como no original
    return true; 
  } catch (error) {
    console.error(`Erro ao atualizar atendimento ${id} (SQL Server):`, error);
    return false;
  }
};

// Marcar como atendido
export const markAsAttended = async (id: string): Promise<boolean> => {
  try {
    return await sqlAttendanceService.markAsAttended(Number(id));
  } catch (error) {
    console.error(`Erro ao marcar atendimento ${id} como atendido (SQL Server):`, error);
    return false;
  }
};

// Excluir registro de atendimento
export const deleteAttendanceRecord = async (id: string): Promise<boolean> => {
  try {
    return await sqlAttendanceService.deleteAttendance(Number(id));
  } catch (error) {
    console.error(`Erro ao excluir atendimento ${id} (SQL Server):`, error);
    return false;
  }
};

// Buscar um atendimento específico
export const findAttendanceRecord = async (id: string): Promise<Attendance | undefined> => {
  try {
    const numericId = Number(id);
    if (isNaN(numericId)) {
        console.error("ID inválido para findAttendanceRecord");
        return undefined;
    }
    const dbRecord = await sqlAttendanceService.getAttendanceById(numericId);
    if (dbRecord) {
        return sqlAttendanceService.mapToAppAttendanceModel(dbRecord);
    }
    return undefined;
  } catch (error) {
    console.error(`Erro ao buscar atendimento ${id} (SQL Server):`, error);
    return undefined;
  }
};

// A função getSectorWhatsAppNumber não interage com a base de dados, mantida como está.
export const getSectorWhatsAppNumber = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO") => {
  const item = localStorage.getItem("sectorPhoneNumbers");
  if (!item) return [];
  try {
    const sectorPhoneNumbers = JSON.parse(item);
    const sectorInfo = sectorPhoneNumbers.find((s: { sector: string; phoneNumbers: any[]; }) => s.sector === sector);
    return sectorInfo ? sectorInfo.phoneNumbers : [];
  } catch (e) {
    console.error("Erro ao parsear sectorPhoneNumbers do localStorage:", e);
    return [];
  }
};

