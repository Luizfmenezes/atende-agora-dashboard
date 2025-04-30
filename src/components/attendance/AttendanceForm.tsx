
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createAttendanceRecord } from "@/lib/attendanceService";
import { findEmployeeByRegistration } from "@/lib/employeeService";
import { PlusCircle, Search } from "lucide-react";

interface AttendanceFormProps {
  onAttendanceCreated: () => void;
}

export const AttendanceForm = ({ onAttendanceCreated }: AttendanceFormProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    registration: "",
    name: "",
    position: "",
    sector: "RH" as "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO",
    reason: ""
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      sector: value as "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await createAttendanceRecord(formData);
      
      toast({
        title: "Atendimento registrado",
        description: `O atendimento para ${formData.name} foi registrado com sucesso e uma notificação foi enviada ao setor.`,
      });
      
      // Reset form
      setFormData({
        registration: "",
        name: "",
        position: "",
        sector: "RH",
        reason: ""
      });
      
      setOpen(false);
      
      // Notify parent component
      onAttendanceCreated();
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Ocorreu um erro ao registrar o atendimento.",
        variant: "destructive",
      });
      console.error("Error creating attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const lookupEmployeeData = () => {
    if (!formData.registration) {
      toast({
        title: "Campo obrigatório",
        description: "Digite uma matrícula para buscar informações do funcionário.",
        variant: "destructive",
      });
      return;
    }

    const employee = findEmployeeByRegistration(formData.registration);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        name: employee.name,
        position: employee.position,
      }));
      toast({
        title: "Funcionário encontrado",
        description: `Dados de ${employee.name} carregados com sucesso.`,
      });
    } else {
      toast({
        title: "Funcionário não encontrado",
        description: "Não foi encontrado funcionário com esta matrícula.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-success hover:bg-success/80 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> NOVO REGISTRO
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Registro de Atendimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="registration">Matrícula</Label>
            <div className="flex gap-2">
              <Input
                id="registration"
                name="registration"
                value={formData.registration}
                onChange={handleChange}
                required
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={lookupEmployeeData} 
                variant="secondary" 
                size="icon"
                title="Buscar dados do funcionário"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Select value={formData.sector} onValueChange={handleSelectChange}>
              <SelectTrigger id="sector">
                <SelectValue placeholder="Selecione um setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RH">RH</SelectItem>
                <SelectItem value="DISCIPLINA">DISCIPLINA</SelectItem>
                <SelectItem value="DP">DP</SelectItem>
                <SelectItem value="PLANEJAMENTO">PLANEJAMENTO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do Atendimento</Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Atendimento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
