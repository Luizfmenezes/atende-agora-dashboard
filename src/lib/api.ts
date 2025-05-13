import sql from "mssql";
import { Attendance } from "./types";
import { dbConfig } from "@/config/dbConfig";

// Buscar atendimentos com filtros
export const getAllAttendances = async (filters?: {
  startDate?: string;
  endDate?: string;
  sector?: string;
  status?: "attended" | "waiting";
}): Promise<Attendance[]> => {

  export const getAttendances = async () => {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Attendances');
    return result.recordset;
  };
  
  try {
    const pool = await sql.connect(dbConfig);

    let query = "SELECT * FROM atendimentos WHERE 1=1";
    const request = pool.request();

    if (filters?.startDate) {
      query += " AND data_hora >= @StartDate";
      request.input("StartDate", sql.DateTime, filters.startDate);
    }

    if (filters?.endDate) {
      query += " AND data_hora <= @EndDate";
      request.input("EndDate", sql.DateTime, filters.endDate);
    }

    if (filters?.sector && filters.sector !== "all") {
      query += " AND setor = @Sector";
      request.input("Sector", sql.VarChar, filters.sector);
    }

    if (filters?.status && filters.status !== "all") {
      const status = filters.status === "attended" ? 1 : 0;
      query += " AND atendido = @Status";
      request.input("Status", sql.Bit, status);
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error);
    return [];
  }
};

// Buscar atendimento por ID
export const getAttendanceById = async (id: string): Promise<Attendance | null> => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Id", sql.Int, parseInt(id))
      .query("SELECT * FROM atendimentos WHERE id = @Id");

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Erro ao buscar atendimento por ID:", error);
    return null;
  }
};

// Criar novo atendimento
export const createAttendance = async (data: {
  usuario_id: string;
  setor: string;
  motivo: string;
}): Promise<Attendance | null> => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("UsuarioId", sql.Int, parseInt(data.usuario_id))
      .input("Setor", sql.VarChar, data.setor)
      .input("Motivo", sql.VarChar, data.motivo)
      .query(`
        INSERT INTO atendimentos (usuario_id, setor, motivo, atendido, data_hora)
        OUTPUT INSERTED.*
        VALUES (@UsuarioId, @Setor, @Motivo, 0, GETDATE())
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Erro ao criar atendimento:", error);
    return null;
  }
};

// Marcar atendimento como atendido
export const markAttendanceAsAttended = async (id: string): Promise<Attendance | null> => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Id", sql.Int, parseInt(id))
      .query(`
        UPDATE atendimentos
        SET atendido = 1
        OUTPUT INSERTED.*
        WHERE id = @Id
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Erro ao marcar atendimento como atendido:", error);
    return null;
  }
};
