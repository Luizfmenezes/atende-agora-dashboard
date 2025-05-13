import { Attendance, DashboardStats } from "./types";
import sql from 'mssql';

// Configuração da conexão com o SQL Server
const dbConfig = {
  user: 'SRVUSER01',
  password: 'Felipe51917610@',
  server: 'SRVSQL',
  database: 'BASE_ATENDE',
  options: {
    encrypt: true, // Para Azure
    trustServerCertificate: true // Para desenvolvimento local
  }
};

// Função auxiliar para converter formato de data
const formatDateForQuery = (dateString?: string): Date | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString);
};

// Mapear resultado do SQL para o modelo Attendance
const mapToAttendanceModel = (record: any): Attendance => ({
  id: record.id.toString(),
  registration: record.registration,
  name: record.name,
  position: record.position,
  sector: record.sector,
  reason: record.reason,
  createdAt: new Date(record.created_at),
  attended: record.attended,
  attendedAt: record.attended_at ? new Date(record.attended_at) : undefined,
  hideAfter: record.hide_after
});

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
    const pool = await sql.connect(dbConfig);
    
    let query = `
      SELECT 
        a.id,
        a.registration,
        a.name,
        a.position,
        s.name AS sector,
        a.reason,
        a.created_at,
        a.attended,
        a.attended_at,
        a.hide_after
      FROM 
        Attendances a
      JOIN 
        Sectors s ON a.sector_id = s.id
      WHERE 1=1
    `;
    
    const params: { name: string, type: any, value: any }[] = [];
    
    if (filters?.startDate) {
      query += ' AND a.created_at >= @startDate';
      params.push({ name: 'startDate', type: sql.DateTime, value: formatDateForQuery(filters.startDate) });
    }
    
    if (filters?.endDate) {
      query += ' AND a.created_at <= @endDate';
      params.push({ name: 'endDate', type: sql.DateTime, value: formatDateForQuery(filters.endDate) });
    }
    
    if (filters?.sector) {
      query += ' AND s.name = @sector';
      params.push({ name: 'sector', type: sql.NVarChar, value: filters.sector });
    }
    
    if (filters?.status === 'waiting') {
      query += ' AND a.attended = 0';
    } else if (filters?.status === 'attended') {
      query += ' AND a.attended = 1';
    }
    
    if (filters?.name) {
      query += ' AND a.name LIKE @name';
      params.push({ name: 'name', type: sql.NVarChar, value: `%${filters.name}%` });
    }
    
    if (filters?.registration) {
      query += ' AND a.registration LIKE @registration';
      params.push({ name: 'registration', type: sql.VarChar, value: `%${filters.registration}%` });
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const request = pool.request();
    params.forEach(param => request.input(param.name, param.type, param.value));
    
    const result = await request.query(query);
    await pool.close();
    
    return result.recordset.map(mapToAttendanceModel);
  } catch (error) {
    console.error("Erro ao buscar registros de atendimento:", error);
    return [];
  }
};

// Registros visíveis na tela principal
export const getVisibleAttendanceRecords = async (filters?: {
  startDate?: string;
  endDate?: string;
  sector?: string;
  status?: string;
  name?: string;
  registration?: string;
}): Promise<Attendance[]> => {
  const records = await getAttendanceRecords(filters);
  
  return records.filter(record => {
    if (!record.attended) return true;
    
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
    const pool = await sql.connect(dbConfig);
    
    const query = `
      SELECT 
        SUM(CASE WHEN attended = 0 THEN 1 ELSE 0 END) AS waiting,
        SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END) AS attended
      FROM Attendances
    `;
    
    const result = await pool.request().query(query);
    await pool.close();
    
    const waiting = result.recordset[0].waiting;
    const attended = result.recordset[0].attended;
    
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
    const pool = await sql.connect(dbConfig);
    
    // Obter ID do setor
    const sectorResult = await pool.request()
      .input('sector', sql.NVarChar, data.sector)
      .query('SELECT id FROM Sectors WHERE name = @sector');
    
    if (sectorResult.recordset.length === 0) {
      throw new Error(`Setor não encontrado: ${data.sector}`);
    }
    
    const sectorId = sectorResult.recordset[0].id;
    
    // Inserir novo atendimento
    const insertResult = await pool.request()
      .input('registration', sql.VarChar, data.registration)
      .input('name', sql.NVarChar, data.name)
      .input('position', sql.NVarChar, data.position)
      .input('sector_id', sql.Int, sectorId)
      .input('reason', sql.NVarChar, data.reason)
      .query(`
        INSERT INTO Attendances (registration, name, position, sector_id, reason)
        OUTPUT INSERTED.*
        VALUES (@registration, @name, @position, @sector_id, @reason)
      `);
    
    await pool.close();
    
    if (insertResult.recordset.length === 0) {
      throw new Error("Erro ao criar atendimento");
    }
    
    return mapToAttendanceModel(insertResult.recordset[0]);
  } catch (error) {
    console.error("Erro ao criar registro de atendimento:", error);
    throw error;
  }
};

// Marcar como atendido
export const markAsAttended = async (id: string): Promise<boolean> => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('attended_at', sql.DateTime, new Date())
      .query(`
        UPDATE Attendances 
        SET attended = 1, attended_at = @attended_at 
        WHERE id = @id
      `);
    
    await pool.close();
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error(`Erro ao marcar atendimento ${id} como atendido:`, error);
    return false;
  }
};

// Excluir registro de atendimento
export const deleteAttendanceRecord = async (id: string): Promise<boolean> => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM Attendances WHERE id = @id');
    
    await pool.close();
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error(`Erro ao excluir atendimento ${id}:`, error);
    return false;
  }
};

// Encontrar um registro específico
export const findAttendanceRecord = async (id: string): Promise<Attendance | undefined> => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT 
          a.id,
          a.registration,
          a.name,
          a.position,
          s.name AS sector,
          a.reason,
          a.created_at,
          a.attended,
          a.attended_at,
          a.hide_after
        FROM 
          Attendances a
        JOIN 
          Sectors s ON a.sector_id = s.id
        WHERE 
          a.id = @id
      `);
    
    await pool.close();
    
    if (result.recordset.length === 0) {
      return undefined;
    }
    
    return mapToAttendanceModel(result.recordset[0]);
  } catch (error) {
    console.error(`Error finding attendance record ${id}:`, error);
    return undefined;
  }
};

// Obter números de WhatsApp do setor
export const getSectorWhatsAppNumber = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO") => {
  // Implementação alternativa para SQL Server
  // Pode ser armazenado em uma tabela ou em um campo JSON na tabela Sectors
  // Aqui estou mantendo similar ao original com localStorage
  const sectorPhoneNumbers = JSON.parse(localStorage.getItem("sectorPhoneNumbers") || "[]");
  const sectorNumbers = sectorPhoneNumbers.find((s: { sector: string; phoneNumbers: any[]; }) => s.sector === sector);
  return sectorNumbers ? sectorNumbers.phoneNumbers : [];
};