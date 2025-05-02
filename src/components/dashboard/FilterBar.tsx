
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Search, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FilterBarProps {
  onFilter: (filters: {
    search: string;
    startDate?: string;
    endDate?: string;
    sector?: string;
    status?: string;
  }) => void;
}

export const FilterBar = ({ onFilter }: FilterBarProps) => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sector, setSector] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  
  const handleSearch = () => {
    onFilter({
      search,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      sector,
      status
    });
  };
  
  const handleClearFilters = () => {
    setSearch("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSector(undefined);
    setStatus(undefined);
    
    onFilter({
      search: "",
      startDate: undefined,
      endDate: undefined,
      sector: undefined,
      status: undefined
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Pesquisar</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Nome ou matrícula..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <div className="w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "dd/MM/yyyy")
                ) : (
                  "Data Inicial"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? (
                  format(endDate, "dd/MM/yyyy")
                ) : (
                  "Data Final"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="RH">RH</SelectItem>
              <SelectItem value="DISCIPLINA">DISCIPLINA</SelectItem>
              <SelectItem value="DP">DP</SelectItem>
              <SelectItem value="PLANEJAMENTO">PLANEJAMENTO</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="waiting">Em Espera</SelectItem>
              <SelectItem value="attended">Atendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleSearch} className="w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
        
        <Button variant="outline" onClick={handleClearFilters} className="w-full md:w-auto">
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};
