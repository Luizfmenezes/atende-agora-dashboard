
import { employeeService as supabaseEmployeeService } from "./supabaseService";

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
    // Tenta buscar do Supabase
    const employee = await supabaseEmployeeService.getEmployeeByRegistration(registration);
    
    if (employee) {
      return {
        registration: employee.matricula,
        name: employee.nome,
        position: employee.cargo
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
    // Tenta buscar do Supabase
    const employees = await supabaseEmployeeService.getAllEmployees();
    
    return employees.map(emp => ({
      registration: emp.matricula,
      name: emp.nome,
      position: emp.cargo
    }));
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    
    // Fallback para o cache local
    return [...EMPLOYEES_CACHE];
  }
};

// In a production environment, this would be a function to import employee data from Excel
export const importEmployeesFromExcel = (excelData: any) => {
  // Implementation would parse Excel data and update EMPLOYEES_DATA
  console.log("Excel import functionality would be implemented here");
};
