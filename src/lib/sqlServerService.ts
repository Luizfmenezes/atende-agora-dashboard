// src/lib/sqlServerService.ts
import sql from "mssql";
import { executeQuery, getDbPool } from "@/integrations/sqlserver/client";
import { Attendance } from "@/lib/types"; // Mantendo este tipo da aplicação, se aplicável

// Tipos para as tabelas do SQL Server (adapte conforme a sua estrutura)
// É importante que os nomes das propriedades correspondam às colunas da sua BD SQL Server
// ou que faça o mapeamento adequado no retorno das queries.
export interface SqlServerUser {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
  // Adicione outros campos se necessário
}

export interface SqlServerSector {
  id: number;
  nome: string;
  codigo: number;
  // Adicione outros campos se necessário
}

export interface SqlServerAttendance {
  id: number;
  matricula: string;
  nome: string;
  cargo: string;
  horario: Date; // SQL Server datetime será provavelmente um objeto Date
  setor_id: number;
  motivo: string;
  usuario_id: number | null;
  atendido: boolean;
  atendido_em: Date | null;
  // Campos de join (exemplo)
  setor_nome?: string;
  setor_codigo?: number;
}

// Serviço para operações com setores
export const sectorService = {
  async getAllSectors(): Promise<SqlServerSector[]> {
    try {
      const result = await executeQuery("SELECT id, nome, codigo FROM setores ORDER BY nome");
      return result.recordset as SqlServerSector[];
    } catch (error) {
      console.error("Erro ao buscar setores no SQL Server:", error);
      throw error;
    }
  },

  async getSectorById(id: number): Promise<SqlServerSector | null> {
    try {
      const result = await executeQuery(
        "SELECT id, nome, codigo FROM setores WHERE id = @sectorId",
        [{ name: "sectorId", type: sql.Int, value: id }]
      );
      if (result.recordset.length > 0) {
        return result.recordset[0] as SqlServerSector;
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar setor ${id} no SQL Server:`, error);
      throw error;
    }
  },

  async getSectorByName(name: string): Promise<SqlServerSector | null> {
    try {
      // Usar LIKE para correspondência insensível a maiúsculas/minúsculas pode depender da collation do seu SQL Server
      // Para uma busca exata insensível, pode ser necessário usar UPPER() ou LOWER() em ambos os lados
      // ou configurar a collation da coluna/base de dados apropriadamente.
      // Exemplo com LIKE (pode precisar de ajuste para insensibilidade total dependendo da collation):
      const result = await executeQuery(
        "SELECT id, nome, codigo FROM setores WHERE nome LIKE @sectorName",
        [{ name: "sectorName", type: sql.NVarChar, value: name }]
      );
      // Se a intenção é um `ilike` (case-insensitive) e `maybeSingle` (retorna o primeiro ou null):
      if (result.recordset.length > 0) {
        return result.recordset[0] as SqlServerSector;
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar setor ${name} no SQL Server:`, error);
      throw error;
    }
  }
};

// Serviço para operações com funcionários
export const employeeService = {
  async getAllEmployees(): Promise<SqlServerUser[]> {
    try {
      const result = await executeQuery("SELECT id, nome, matricula, cargo FROM funcionarios ORDER BY nome");
      return result.recordset as SqlServerUser[];
    } catch (error) {
      console.error("Erro ao buscar funcionários no SQL Server:", error);
      throw error;
    }
  },

  async getEmployeeByRegistration(registration: string): Promise<SqlServerUser | null> {
    try {
      const result = await executeQuery(
        "SELECT id, nome, matricula, cargo FROM funcionarios WHERE matricula = @registration",
        [{ name: "registration", type: sql.NVarChar, value: registration }]
      );
      if (result.recordset.length > 0) {
        return result.recordset[0] as SqlServerUser;
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar funcionário com matrícula ${registration} no SQL Server:`, error);
      throw error;
    }
  },

  async createEmployee(employee: {
    matricula: string;
    nome: string;
    cargo: string;
  }): Promise<SqlServerUser | null> {
    try {
      // Adicionar OUTPUT inserted.* para retornar o registo inserido
      const result = await executeQuery(
        "INSERT INTO funcionarios (matricula, nome, cargo) OUTPUT inserted.id, inserted.nome, inserted.matricula, inserted.cargo VALUES (@matricula, @nome, @cargo)",
        [
          { name: "matricula", type: sql.NVarChar, value: employee.matricula },
          { name: "nome", type: sql.NVarChar, value: employee.nome },
          { name: "cargo", type: sql.NVarChar, value: employee.cargo },
        ]
      );
      if (result.recordset.length > 0) {
        return result.recordset[0] as SqlServerUser;
      }
      return null;
    } catch (error) {
      console.error("Erro ao criar funcionário no SQL Server:", error);
      throw error;
    }
  }
};

// Serviço para operações com atendimentos
export const attendanceService = {
  async getAllAttendances(filters?: {
    startDate?: string; // ISO string date
    endDate?: string;   // ISO string date
    sector?: number | string; // ID ou nome do setor
    // status?: "attended" | "waiting"; // Este filtro era aplicado em memória no código original, pode ser movido para SQL
  }): Promise<SqlServerAttendance[]> {
    try {
      let queryString = `
        SELECT 
          a.id, a.matricula, a.nome, a.cargo, a.horario, a.setor_id, a.motivo, a.usuario_id, a.atendido, a.atendido_em,
          s.nome AS setor_nome, 
          s.codigo AS setor_codigo 
        FROM atendimentos a
        LEFT JOIN setores s ON a.setor_id = s.id
      `;
      
      const conditions: string[] = [];
      const queryParams: any[] = [];

      if (filters?.startDate) {
        conditions.push("a.horario >= @startDate");
        queryParams.push({ name: "startDate", type: sql.DateTime, value: new Date(filters.startDate) });
      }
      
      if (filters?.endDate) {
        // Adicionar 1 dia e subtrair 1 segundo para incluir todo o dia final, ou ajustar a lógica de comparação
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setSeconds(endDate.getSeconds() -1);
        conditions.push("a.horario <= @endDate");
        queryParams.push({ name: "endDate", type: sql.DateTime, value: endDate });
      }
      
      if (filters?.sector) {
        if (typeof filters.sector === "number") {
          conditions.push("a.setor_id = @sectorId");
          queryParams.push({ name: "sectorId", type: sql.Int, value: filters.sector });
        } else if (typeof filters.sector === "string") {
          // Se o filtro de setor for por nome, pode ser necessário uma subquery ou um join adicional
          // ou, como no original, buscar o ID do setor primeiro.
          // Para simplificar aqui, assumimos que se for string, é o nome e faremos um LIKE
          // (ou buscar o ID primeiro e depois filtrar por setor_id)
          const sectorData = await sectorService.getSectorByName(filters.sector);
          if (sectorData) {
            conditions.push("a.setor_id = @sectorIdByName");
            queryParams.push({ name: "sectorIdByName", type: sql.Int, value: sectorData.id });
          } else {
            // Setor não encontrado pelo nome, pode retornar vazio ou ignorar este filtro
            return []; 
          }
        }
      }

      if (conditions.length > 0) {
        queryString += " WHERE " + conditions.join(" AND ");
      }
      
      queryString += " ORDER BY a.horario DESC";
      
      const result = await executeQuery(queryString, queryParams);
      return result.recordset as SqlServerAttendance[];
    } catch (error) {
      console.error("Erro ao buscar atendimentos no SQL Server:", error);
      throw error;
    }
  },

  async getAttendanceById(id: number): Promise<SqlServerAttendance | null> {
    try {
      const queryString = `
        SELECT 
          a.id, a.matricula, a.nome, a.cargo, a.horario, a.setor_id, a.motivo, a.usuario_id, a.atendido, a.atendido_em,
          s.nome AS setor_nome,
          s.codigo AS setor_codigo
        FROM atendimentos a
        LEFT JOIN setores s ON a.setor_id = s.id
        WHERE a.id = @attendanceId
      `;
      const result = await executeQuery(queryString, [{ name: "attendanceId", type: sql.Int, value: id }]);
      
      if (result.recordset.length > 0) {
        return result.recordset[0] as SqlServerAttendance;
      }
      return null;
    } catch (error) {
      console.error(`Erro ao buscar atendimento ${id} no SQL Server:`, error);
      throw error;
    }
  },

  async createAttendance(attendance: {
    matricula: string;
    nome: string;
    cargo: string;
    setor_id: number;
    motivo: string;
    usuario_id?: number | null; // Permitir null
    // horario é gerado automaticamente pelo SQL Server com GETDATE() ou CURRENT_TIMESTAMP como default na tabela
  }): Promise<SqlServerAttendance | null> {
    try {
      // Assumindo que a coluna 'horario' tem um valor DEFAULT GETDATE() no SQL Server
      // e 'atendido' tem DEFAULT 0 (false), 'atendido_em' pode ser NULL
      const queryString = `
        INSERT INTO atendimentos (matricula, nome, cargo, setor_id, motivo, usuario_id)
        OUTPUT inserted.id, inserted.matricula, inserted.nome, inserted.cargo, inserted.horario, inserted.setor_id, inserted.motivo, inserted.usuario_id, inserted.atendido, inserted.atendido_em
        VALUES (@matricula, @nome, @cargo, @setor_id, @motivo, @usuario_id)
      `;
      const params = [
        { name: "matricula", type: sql.NVarChar, value: attendance.matricula },
        { name: "nome", type: sql.NVarChar, value: attendance.nome },
        { name: "cargo", type: sql.NVarChar, value: attendance.cargo },
        { name: "setor_id", type: sql.Int, value: attendance.setor_id },
        { name: "motivo", type: sql.NVarChar, value: attendance.motivo },
        { name: "usuario_id", type: sql.Int, value: attendance.usuario_id === undefined ? null : attendance.usuario_id } // Tratar undefined como null
      ];
      
      const result = await executeQuery(queryString, params);
      
      if (result.recordset.length > 0) {
        // Precisamos buscar os dados do setor para popular setor_nome e setor_codigo
        const createdAttendance = result.recordset[0] as SqlServerAttendance;
        if (createdAttendance.setor_id) {
            const sectorData = await sectorService.getSectorById(createdAttendance.setor_id);
            if (sectorData) {
                createdAttendance.setor_nome = sectorData.nome;
                createdAttendance.setor_codigo = sectorData.codigo;
            }
        }
        return createdAttendance;
      }
      return null;
    } catch (error) {
      console.error("Erro ao criar atendimento no SQL Server:", error);
      throw error;
    }
  },

  async markAsAttended(id: number): Promise<boolean> {
    try {
      const queryString = `
        UPDATE atendimentos 
        SET atendido = 1, atendido_em = GETDATE()
        WHERE id = @attendanceId
      `;
      const result = await executeQuery(queryString, [{ name: "attendanceId", type: sql.Int, value: id }]);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(`Erro ao marcar atendimento ${id} como atendido no SQL Server:`, error);
      throw error; // ou return false
    }
  },

  async deleteAttendance(id: number): Promise<boolean> {
    try {
      const queryString = "DELETE FROM atendimentos WHERE id = @attendanceId";
      const result = await executeQuery(queryString, [{ name: "attendanceId", type: sql.Int, value: id }]);
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(`Erro ao excluir atendimento ${id} no SQL Server:`, error);
      throw error; // ou return false
    }
  },

  // A função mapToAttendanceModel era específica para o formato de retorno do Supabase.
  // Agora, as queries SQL já podem retornar os dados mais próximos do formato da aplicação.
  // Se ainda for necessário um mapeamento para o tipo `Attendance` da aplicação, ele pode ser feito aqui
  // ou na camada de serviço que consome este `sqlServerService`.
  // Exemplo: Se o tipo `Attendance` da aplicação for diferente de `SqlServerAttendance`.
  mapToAppAttendanceModel(sqlServerAttendance: SqlServerAttendance): Attendance {
    return {
      id: String(sqlServerAttendance.id),
      registration: sqlServerAttendance.matricula,
      name: sqlServerAttendance.nome,
      position: sqlServerAttendance.cargo,
      sector: sqlServerAttendance.setor_nome || "DESCONHECIDO", // Usar o campo de join
      reason: sqlServerAttendance.motivo,
      createdAt: sqlServerAttendance.horario.toISOString(), // Converter Date para ISO string
      attended: sqlServerAttendance.atendido || false,
      attendedAt: sqlServerAttendance.atendido_em ? sqlServerAttendance.atendido_em.toISOString() : undefined,
      // hideAfter: supabaseAttendance.atendido ? 40 : undefined, // Esta lógica pode ser mantida na camada superior
    };
  }
};

