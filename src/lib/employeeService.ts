import sql from 'mssql';
import { dbConfig } from './dbConfig'; // Importe a configuração compartilhada

type Employee = {
  registration: string;
  name: string;
  position: string;
};

// Local cache of employees (for fallback)
const EMPLOYEES_CACHE: Employee[] = [
  { registration: "12345", name: "João Silva", position: "Analista" },
  { registration: "54321", name: "Maria Oliveira", position: "Coordenadora" },
  { registration: "67890", name: "Carlos Santos", position: "Professor" },
  { registration: "11223", name: "Ana Pereira", position: "Diretora" },
  { registration: "33445", name: "Roberto Lima", position: "Motorista" },
  // ... mais funcionários
];

export const findEmployeeByRegistration = async (registration: string): Promise<Employee | null> => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input('registration', sql.VarChar, registration)
      .query(`
        SELECT 
          registration, 
          name, 
          position 
        FROM 
          Employees 
        WHERE 
          registration = @registration
      `);
    
    await pool.close();
    
    if (result.recordset.length > 0) {
      const employee = result.recordset[0];
      return {
        registration: employee.registration,
        name: employee.name,
        position: employee.position
      };
    }
    
    // Fallback para buscar do cache local
    const cachedEmployee = EMPLOYEES_CACHE.find(emp => emp.registration === registration);
    return cachedEmployee || null;
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    
    // Fallback para buscar do cache local
    const cachedEmployee = EMPLOYEES_CACHE.find(emp => emp.registration === registration);
    return cachedEmployee || null;
  }
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .query(`
        SELECT 
          registration, 
          name, 
          position 
        FROM 
          Employees
        ORDER BY 
          name
      `);
    
    await pool.close();
    
    return result.recordset.map(emp => ({
      registration: emp.registration,
      name: emp.name,
      position: emp.position
    }));
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    
    // Fallback para o cache local
    return [...EMPLOYEES_CACHE];
  }
};

// Função para importar funcionários do Excel (versão SQL Server)
export const importEmployeesFromExcel = async (excelData: any[]): Promise<boolean> => {
  try {
    const pool = await sql.connect(dbConfig);
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      
      // Limpar tabela antes de importar (opcional)
      await request.query('DELETE FROM Employees');
      
      // Inserir cada funcionário
      for (const employee of excelData) {
        await request
          .input('registration', sql.VarChar, employee.registration)
          .input('name', sql.NVarChar, employee.name)
          .input('position', sql.NVarChar, employee.position)
          .query(`
            INSERT INTO Employees (registration, name, position)
            VALUES (@registration, @name, @position)
          `);
      }
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      await pool.close();
    }
  } catch (error) {
    console.error("Erro ao importar funcionários:", error);
    return false;
  }
};

// Criar tabela de funcionários (executar uma vez)
export const createEmployeesTable = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Employees' AND xtype='U')
      CREATE TABLE Employees (
        id INT IDENTITY(1,1) PRIMARY KEY,
        registration VARCHAR(50) NOT NULL UNIQUE,
        name NVARCHAR(100) NOT NULL,
        position NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    await pool.close();
    console.log('Tabela Employees verificada/criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela Employees:', error);
  }
};