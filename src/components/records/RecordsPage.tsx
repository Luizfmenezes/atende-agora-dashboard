
import { useState, useEffect } from "react";
import { Attendance } from "@/lib/types";
import { RecordsTable } from "@/components/records/RecordsTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { getAttendanceRecords } from "@/lib/attendanceService";
import { useToast } from "@/components/ui/use-toast";

const RecordsPage = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    sector: "all",
    status: "all"
  });
  const { toast } = useToast();
  
  useEffect(() => {
    // Carregar registros iniciais
    loadRecords();
  }, []);
  
  const loadRecords = async (customFilters?: typeof filters) => {
    setLoading(true);
    try {
      const filtersToUse = customFilters || filters;
      const allRecords = await getAttendanceRecords({
        startDate: filtersToUse.startDate || undefined,
        endDate: filtersToUse.endDate || undefined,
        sector: filtersToUse.sector !== "all" ? filtersToUse.sector : undefined,
        status: filtersToUse.status !== "all" ? filtersToUse.status : undefined,
        name: filtersToUse.search || undefined,
        registration: filtersToUse.search || undefined
      });
      setRecords(allRecords);
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
      toast({
        title: "Erro ao carregar registros",
        description: "Ocorreu um erro ao buscar os registros de atendimento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const handleStatusChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      status: value
    }));
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecords();
  };
  
  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      startDate: "",
      endDate: "",
      sector: "all",
      status: "all"
    };
    
    setFilters(resetFilters);
    loadRecords(resetFilters);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-md p-4 space-y-4">
        <h3 className="text-lg font-medium">Filtros</h3>
        
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <SelectItem value="all">Todos os setores</SelectItem>
                  <SelectItem value="RH">RH</SelectItem>
                  <SelectItem value="DISCIPLINA">DISCIPLINA</SelectItem>
                  <SelectItem value="DP">DP</SelectItem>
                  <SelectItem value="PLANEJAMENTO">PLANEJAMENTO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="waiting">Em Espera</SelectItem>
                  <SelectItem value="attended">Atendidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleResetFilters} disabled={loading}>
              Limpar Filtros
            </Button>
            <Button type="submit" disabled={loading}>
              <Filter className="mr-2 h-4 w-4" /> 
              {loading ? "Buscando..." : "Filtrar"}
            </Button>
          </div>
        </form>
      </div>
      
      <RecordsTable records={records} />
    </div>
  );
};

export default RecordsPage;
