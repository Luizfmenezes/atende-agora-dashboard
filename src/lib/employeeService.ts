// src/lib/employeeService.ts
// Alterar a importação para o novo serviço SQL Server
import { employeeService as sqlEmployeeService } from "./sqlServerService";
import type { SqlServerUser } from "./sqlServerService"; // Importar o tipo do SQL Server Service

// Manter o tipo Employee da aplicação, se for diferente ou precisar de mapeamento
type Employee = {
  registration: string;
  name: string;
  position: string;
};

// Local cache of employees (mantido como fallback)
const EMPLOYEES_CACHE: Employee[] = [
  { registration: "12345", name: "João Silva", position: "Analista" },
  { registration: "54321", name: "Maria Oliveira", position: "Coordenadora" },
  { registration: "67890", name: "Carlos Santos", position: "Professor" },
  { registration: "11223", name: "Ana Pereira", position: "Diretora" },
  { registration: "33445", name: "Roberto Lima", position: "Motorista" },
  // ... mais funcionários
];

// Função para mapear de SqlServerUser para Employee (se necessário)
const mapDbUserToAppEmployee = (dbUser: SqlServerUser): Employee => {
  return {
    registration: dbUser.matricula, // O campo é matricula no SqlServerUser
    name: dbUser.nome,
    position: dbUser.cargo
  };
};

export const findEmployeeByRegistration = async (registration: string): Promise<Employee | null> => {
  try {
    // Tenta buscar do SQL Server usando o novo serviço
    const employeeDb = await sqlEmployeeService.getEmployeeByRegistration(registration);
    
    if (employeeDb) {
      return mapDbUserToAppEmployee(employeeDb);
    }
    
    // Fallback para buscar do cache local
    console.warn(`Funcionário com matrícula ${registration} não encontrado na BD, usando cache.`);
    const cachedEmployee = EMPLOYEES_CACHE.find(emp => emp.registration === registration);
    return cachedEmployee || null;
  } catch (error) {
    console.error("Erro ao buscar funcionário (SQL Server):", error);
    
    // Fallback para buscar do cache local em caso de erro na BD
    console.warn(`Erro ao aceder à BD para matrícula ${registration}, usando cache como fallback.`);
    const cachedEmployee = EMPLOYEES_CACHE.find(emp => emp.registration === registration);
    return cachedEmployee || null;
  }
};

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    // Tenta buscar do SQL Server
    const employeesDb = await sqlEmployeeService.getAllEmployees();
    
    return employeesDb.map(mapDbUserToAppEmployee);
  } catch (error) {
    console.error("Erro ao buscar todos os funcionários (SQL Server):", error);
    
    // Fallback para o cache local
    console.warn("Erro ao aceder à BD para buscar todos os funcionários, usando cache como fallback.");
    return [...EMPLOYEES_CACHE];
  }
};

// Placeholder mantido
export const importEmployeesFromExcel = (excelData: any) => {
  // Implementation would parse Excel data and update EMPLOYEES_DATA
  // Potentially, this could call a function in sqlEmployeeService to bulk insert/update
  console.log("Funcionalidade de importação de Excel a ser implementada aqui. Dados recebidos:", excelData);
};

