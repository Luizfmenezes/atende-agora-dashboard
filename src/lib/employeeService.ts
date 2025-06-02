
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
    // For now, we'll use the local cache until employee service is implemented
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
    // For now, return the local cache until employee service is implemented
    return [...EMPLOYEES_CACHE];
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
