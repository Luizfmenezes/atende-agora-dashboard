
type Employee = {
  registration: string;
  name: string;
  position: string;
};

// Mock database of employees (would be replaced with real data in production)
const EMPLOYEES_DATA: Employee[] = [
  { registration: "12345", name: "João Silva", position: "Analista" },
  { registration: "54321", name: "Maria Oliveira", position: "Coordenadora" },
  { registration: "67890", name: "Carlos Santos", position: "Professor" },
  { registration: "11223", name: "Ana Pereira", position: "Diretora" },
  { registration: "33445", name: "Roberto Lima", position: "Motorista" }
];

export const findEmployeeByRegistration = (registration: string): Employee | null => {
  const employee = EMPLOYEES_DATA.find(emp => emp.registration === registration);
  return employee || null;
};

export const getAllEmployees = (): Employee[] => {
  return [...EMPLOYEES_DATA];
};

// In a production environment, this would be a function to import employee data from Excel
export const importEmployeesFromExcel = (excelData: any) => {
  // Implementation would parse Excel data and update EMPLOYEES_DATA
  console.log("Excel import functionality would be implemented here");
};
