
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createAttendanceRecord } from "@/lib/attendanceService";
import { PlusCircle } from "lucide-react";

interface AttendanceFormProps {
  onAttendanceCreated: () => void;
}

export const AttendanceForm = ({ onAttendanceCreated }: AttendanceFormProps) => {
  const [open, setOpen] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      createAttendanceRecord(formData);
      
      toast({
        title: "Atendimento registrado",
        description: `O atendimento para ${formData.name} foi registrado com sucesso.`,
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
            <Input
              id="registration"
              name="registration"
              value={formData.registration}
              onChange={handleChange}
              required
            />
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
            <Button type="submit">Registrar Atendimento</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
