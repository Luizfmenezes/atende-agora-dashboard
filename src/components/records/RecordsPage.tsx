
import { useState, useEffect } from "react";
import { getAttendanceRecords } from "@/lib/attendanceService";
import { Attendance } from "@/lib/types";
import { RecordsTable } from "@/components/records/RecordsTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

const RecordsPage = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    sector: ""
  });
  
  useEffect(() => {
    // Carregar registros iniciais
    const allRecords = getAttendanceRecords();
    setRecords(allRecords);
  }, []);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSectorChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      sector: value
    }));
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredRecords = getAttendanceRecords({
      startDate: filters.startDate,
      endDate: filters.endDate,
      sector: filters.sector || undefined,
      name: filters.search,
      registration: filters.search
    });
    
    setRecords(filteredRecords);
  };
  
  const handleResetFilters = () => {
    setFilters({
      search: "",
      startDate: "",
      endDate: "",
      sector: ""
    });
    
    const allRecords = getAttendanceRecords();
    setRecords(allRecords);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-md p-4 space-y-4">
        <h3 className="text-lg font-medium">Filtros</h3>
        
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Busca (Nome ou Matrícula)</Label>
              <Input
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Digite para buscar..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Select value={filters.sector} onValueChange={handleSectorChange}>
                <SelectTrigger id="sector">
                  <SelectValue placeholder="Todos os setores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os setores</SelectItem>
                  <SelectItem value="RH">RH</SelectItem>
                  <SelectItem value="DISCIPLINA">DISCIPLINA</SelectItem>
                  <SelectItem value="DP">DP</SelectItem>
                  <SelectItem value="PLANEJAMENTO">PLANEJAMENTO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleResetFilters}>
              Limpar Filtros
            </Button>
            <Button type="submit">
              <Filter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
          </div>
        </form>
      </div>
      
      <RecordsTable records={records} />
    </div>
  );
};

export default RecordsPage;
