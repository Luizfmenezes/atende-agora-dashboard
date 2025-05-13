import sql from 'mssql';
import { dbConfig } from './dbConfig';

// Tipos para as tabelas do SQL Server
export interface SqlUser {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
}

export interface SqlSector {
  id: number;
  nome: string;
  codigo: number;
}

export interface SqlAttendance {
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
  async getAllSectors(): Promise<SqlSector[]> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .query('SELECT * FROM setores ORDER BY nome');
      
      await pool.close();
      return result.recordset;
    } catch (error) {
      console.error("Erro ao buscar setores:", error);
      throw error;
    }
  },
  
  // Buscar setor por ID
  async getSectorById(id: number): Promise<SqlSector | null> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM setores WHERE id = @id');
      
      await pool.close();
      return result.recordset[0] || null;
    } catch (error) {
      console.error(`Erro ao buscar setor ${id}:`, error);
      return null;
    }
  },
  
  // Buscar setor por nome
  async getSectorByName(name: string): Promise<SqlSector | null> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('nome', sql.NVarChar, name)
        .query('SELECT * FROM setores WHERE nome LIKE @nome');
      
      await pool.close();
      return result.recordset[0] || null;
    } catch (error) {
      console.error(`Erro ao buscar setor ${name}:`, error);
      return null;
    }
  }
};

// Serviço para operações com funcionários
export const employeeService = {
  // Buscar todos os funcionários
  async getAllEmployees(): Promise<SqlUser[]> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .query('SELECT * FROM funcionarios ORDER BY nome');
      
      await pool.close();
      return result.recordset;
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw error;
    }
  },
  
  // Buscar funcionário por matrícula
  async getEmployeeByRegistration(registration: string): Promise<SqlUser | null> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('matricula', sql.VarChar, registration)
        .query('SELECT * FROM funcionarios WHERE matricula = @matricula');
      
      await pool.close();
      return result.recordset[0] || null;
    } catch (error) {
      console.error(`Erro ao buscar funcionário com matrícula ${registration}:`, error);
      return null;
    }
  },
  
  // Criar novo funcionário
  async createEmployee(employee: {
    matricula: string;
    nome: string;
    cargo: string;
  }): Promise<SqlUser | null> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('matricula', sql.VarChar, employee.matricula)
        .input('nome', sql.NVarChar, employee.nome)
        .input('cargo', sql.NVarChar, employee.cargo)
        .query(`
          INSERT INTO funcionarios (matricula, nome, cargo)
          OUTPUT INSERTED.*
          VALUES (@matricula, @nome, @cargo)
        `);
      
      await pool.close();
      return result.recordset[0] || null;
    } catch (error) {
      console.error("Erro ao criar funcionário:", error);
      throw error;
    }
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
  }): Promise<SqlAttendance[]> {
    try {
      const pool = await sql.connect(dbConfig);
      let query = `
        SELECT 
          a.*,
          s.nome AS sector_nome,
          s.codigo AS sector_codigo
        FROM 
          atendimentos a
        JOIN 
          setores s ON a.setor_id = s.id
        WHERE 1=1
      `;
      
      const params: { name: string, type: any, value: any }[] = [];
      
      if (filters?.startDate) {
        query += ' AND a.horario >= @startDate';
        params.push({ name: 'startDate', type: sql.DateTime, value: new Date(filters.startDate) });
      }
      
      if (filters?.endDate) {
        query += ' AND a.horario <= @endDate';
        params.push({ name: 'endDate', type: sql.DateTime, value: new Date(filters.endDate) });
      }
      
      if (filters?.sector) {
        if (typeof filters.sector === 'number') {
          query += ' AND a.setor_id = @setor_id';
          params.push({ name: 'setor_id', type: sql.Int, value: filters.sector });
        } else if (typeof filters.sector === 'string') {
          const sector = await sectorService.getSectorByName(filters.sector);
          if (sector) {
            query += ' AND a.setor_id = @setor_id';
            params.push({ name: 'setor_id', type: sql.Int, value: sector.id });
          }
        }
      }
      
      if (filters?.status === 'waiting') {
        query += ' AND a.atendido = 0';
      } else if (filters?.status === 'attended') {
        query += ' AND a.atendido = 1';
      }
      
      query += ' ORDER BY a.horario DESC';
      
      const request = pool.request();
      params.forEach(param => request.input(param.name, param.type, param.value));
      
      const result = await request.query(query);
      await pool.close();
      
      return result.recordset;
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
      throw error;
    }
  },
  
  // Buscar atendimento por ID
  async getAttendanceById(id: number): Promise<SqlAttendance | null> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT 
            a.*,
            s.nome AS sector_nome,
            s.codigo AS sector_codigo
          FROM 
            atendimentos a
          JOIN 
            setores s ON a.setor_id = s.id
          WHERE 
            a.id = @id
        `);
      
      await pool.close();
      return result.recordset[0] || null;
    } catch (error) {
      console.error(`Erro ao buscar atendimento ${id}:`, error);
      return null;
    }
  },
  
  // Criar novo atendimento
  async createAttendance(attendance: {
    matricula: string;
    nome: string;
    cargo: string;
    setor_id: number;
    motivo: string;
    usuario_id?: number;
  }): Promise<SqlAttendance | null> {
    try {
      const pool = await sql.connect(dbConfig);
      const request = pool.request()
        .input('matricula', sql.VarChar, attendance.matricula)
        .input('nome', sql.NVarChar, attendance.nome)
        .input('cargo', sql.NVarChar, attendance.cargo)
        .input('setor_id', sql.Int, attendance.setor_id)
        .input('motivo', sql.NVarChar, attendance.motivo);
      
      if (attendance.usuario_id) {
        request.input('usuario_id', sql.Int, attendance.usuario_id);
      }
      
      const result = await request.query(`
        INSERT INTO atendimentos (
          matricula, nome, cargo, setor_id, motivo${attendance.usuario_id ? ', usuario_id' : ''}
        )
        OUTPUT INSERTED.*
        VALUES (
          @matricula, @nome, @cargo, @setor_id, @motivo${attendance.usuario_id ? ', @usuario_id' : ''}
        )
      `);
      
      await pool.close();
      return result.recordset[0] || null;
    } catch (error) {
      console.error("Erro ao criar atendimento:", error);
      throw error;
    }
  },
  
  // Marcar atendimento como atendido
  async markAsAttended(id: number): Promise<boolean> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('atendido_em', sql.DateTime, new Date())
        .query(`
          UPDATE atendimentos
          SET 
            atendido = 1,
            atendido_em = @atendido_em
          WHERE 
            id = @id
        `);
      
      await pool.close();
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(`Erro ao marcar atendimento ${id} como atendido:`, error);
      return false;
    }
  },
  
  // Excluir atendimento
  async deleteAttendance(id: number): Promise<boolean> {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM atendimentos WHERE id = @id');
      
      await pool.close();
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error(`Erro ao excluir atendimento ${id}:`, error);
      return false;
    }
  },
  
  // Converter atendimentos do SQL Server para o formato da aplicação
  mapToAttendanceModel(sqlAttendance: any): Attendance {
    return {
      id: String(sqlAttendance.id),
      registration: sqlAttendance.matricula,
      name: sqlAttendance.nome,
      position: sqlAttendance.cargo,
      sector: sqlAttendance.sector_nome || "DESCONHECIDO",
      reason: sqlAttendance.motivo,
      createdAt: sqlAttendance.horario,
      attended: sqlAttendance.atendido || false,
      attendedAt: sqlAttendance.atendido_em || undefined,
      hideAfter: sqlAttendance.atendido ? 40 : undefined,
    };
  }
};

// Funções para criar tabelas (executar uma vez)
export const createTables = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Criar tabela de setores
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='setores' AND xtype='U')
      CREATE TABLE setores (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nome NVARCHAR(100) NOT NULL,
        codigo INT
      )
    `);
    
    // Criar tabela de funcionários
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='funcionarios' AND xtype='U')
      CREATE TABLE funcionarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        matricula VARCHAR(50) NOT NULL UNIQUE,
        nome NVARCHAR(100) NOT NULL,
        cargo NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    // Criar tabela de atendimentos
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='atendimentos' AND xtype='U')
      CREATE TABLE atendimentos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        matricula VARCHAR(50) NOT NULL,
        nome NVARCHAR(100) NOT NULL,
        cargo NVARCHAR(100),
        horario DATETIME2 DEFAULT GETDATE(),
        setor_id INT NOT NULL,
        motivo NVARCHAR(MAX),
        usuario_id INT,
        atendido BIT DEFAULT 0,
        atendido_em DATETIME2,
        FOREIGN KEY (setor_id) REFERENCES setores(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);
    
    await pool.close();
    console.log('Tabelas verificadas/criadas com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  }
};