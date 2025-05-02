
import { Attendance, DashboardStats } from "@/lib/types";
import { getWhatsAppNumberForSector, sendWhatsAppMessage, createAttendanceNotificationMessage } from "@/lib/whatsappService";

// Mock do banco de dados
// Em uma implementação real, você usaria uma API conectada a um banco SQLite
let ATTENDANCE_RECORDS: Attendance[] = [
  {
    id: "1",
    registration: "12345",
    name: "João Silva",
    position: "Analista",
    sector: "RH",
    reason: "Atualização de documento",
    createdAt: "2025-04-29T10:30:00",
    attended: false
  },
  {
    id: "2",
    registration: "54321",
    name: "Maria Oliveira",
    position: "Coordenadora",
    sector: "DP",
    reason: "Problema com pagamento",
    createdAt: "2025-04-29T09:15:00", 
    attended: true,
    attendedAt: "2025-04-29T10:15:00"
  },
  {
    id: "3",
    registration: "67890",
    name: "Carlos Santos",
    position: "Professor",
    sector: "PLANEJAMENTO",
    reason: "Planejamento de aula",
    createdAt: "2025-04-29T11:45:00",
    attended: false
  }
];

export const getAttendanceRecords = (
  filters?: {
    startDate?: string;
    endDate?: string;
    sector?: string;
    name?: string;
    registration?: string;
    status?: string;
  }
): Attendance[] => {
  let filteredRecords = [...ATTENDANCE_RECORDS];
  
  if (filters) {
    if (filters.startDate) {
      filteredRecords = filteredRecords.filter(
        record => new Date(record.createdAt) >= new Date(filters.startDate!)
      );
    }
    
    if (filters.endDate) {
      filteredRecords = filteredRecords.filter(
        record => new Date(record.createdAt) <= new Date(filters.endDate!)
      );
    }
    
    if (filters.sector && filters.sector !== "all") {
      filteredRecords = filteredRecords.filter(
        record => record.sector === filters.sector
      );
    }
    
    if (filters.name) {
      filteredRecords = filteredRecords.filter(
        record => record.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }
    
    if (filters.registration) {
      filteredRecords = filteredRecords.filter(
        record => record.registration.includes(filters.registration!)
      );
    }
    
    if (filters.status) {
      if (filters.status === "attended") {
        filteredRecords = filteredRecords.filter(record => record.attended);
      } else if (filters.status === "waiting") {
        filteredRecords = filteredRecords.filter(record => !record.attended);
      }
    }
  }
  
  // Ordenar por data (mais recente primeiro)
  return filteredRecords.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getVisibleAttendanceRecords = (
  filters?: {
    startDate?: string;
    endDate?: string;
    sector?: string;
    name?: string;
    registration?: string;
    status?: string;
  }
): Attendance[] => {
  // Obter todos os registros com base nos filtros
  let records = getAttendanceRecords(filters);
  
  // Filtrar registros atendidos que devem ser ocultados do dashboard
  // mas não da aba de registros
  const currentTime = new Date().getTime();
  
  return records.filter(record => {
    if (record.attended && record.hideAfter) {
      const hideTime = new Date(record.hideAfter).getTime();
      return currentTime < hideTime;
    }
    return true;
  });
};

export const createAttendanceRecord = async (record: Omit<Attendance, "id" | "createdAt" | "attended">): Promise<Attendance> => {
  const newRecord: Attendance = {
    ...record,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    attended: false
  };
  
  ATTENDANCE_RECORDS.unshift(newRecord);
  
  // Enviar notificação por WhatsApp
  try {
    const phoneNumber = getWhatsAppNumberForSector(record.sector);
    if (phoneNumber) {
      const message = createAttendanceNotificationMessage(
        record.name,
        record.registration,
        record.position,
        record.reason
      );
      
      await sendWhatsAppMessage(phoneNumber, message);
    }
  } catch (error) {
    console.error("Erro ao enviar notificação WhatsApp:", error);
  }
  
  return newRecord;
};

export const updateAttendanceRecord = (id: string, updatedData: Partial<Attendance>): Attendance | null => {
  const index = ATTENDANCE_RECORDS.findIndex(record => record.id === id);
  if (index !== -1) {
    ATTENDANCE_RECORDS[index] = {
      ...ATTENDANCE_RECORDS[index],
      ...updatedData
    };
    return ATTENDANCE_RECORDS[index];
  }
  return null;
};

export const deleteAttendanceRecord = (id: string): boolean => {
  const index = ATTENDANCE_RECORDS.findIndex(record => record.id === id);
  if (index !== -1) {
    ATTENDANCE_RECORDS.splice(index, 1);
    return true;
  }
  return false;
};

export const getDashboardStats = (): DashboardStats => {
  const waiting = ATTENDANCE_RECORDS.filter(record => !record.attended).length;
  const attended = ATTENDANCE_RECORDS.filter(record => record.attended).length;
  
  return {
    waiting,
    attended,
    remaining: waiting
  };
};

export const markAsAttended = (id: string): boolean => {
  const now = new Date();
  const currentTime = now.toISOString();
  
  // Calcular quando este registro deve ser escondido (40 segundos a partir de agora)
  const hideTime = new Date(now.getTime() + 40 * 1000).getTime();
  
  return updateAttendanceRecord(id, { 
    attended: true,
    attendedAt: currentTime,
    hideAfter: hideTime
  }) !== null;
};
