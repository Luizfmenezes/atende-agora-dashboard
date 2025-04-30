
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { validatePermission } from "@/lib/auth";
import { Attendance } from "@/lib/types";
import { updateAttendanceRecord, markAsAttended, deleteAttendanceRecord } from "@/lib/attendanceService";
import { Pencil, CheckCircle, Trash2 } from "lucide-react";

interface AttendanceTableProps {
  attendanceRecords: Attendance[];
  onAttendanceUpdated: () => void;
}

export const AttendanceTable = ({ attendanceRecords, onAttendanceUpdated }: AttendanceTableProps) => {
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Attendance>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const canEdit = validatePermission(user, "edit");
  const canDelete = validatePermission(user, "delete");

  const handleEditClick = (record: Attendance) => {
    setSelectedRecord(record);
    setEditFormData({
      registration: record.registration,
      name: record.name,
      position: record.position,
      sector: record.sector,
      reason: record.reason,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSelectChange = (value: string) => {
    setEditFormData(prev => ({
      ...prev,
      sector: value as "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO"
    }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRecord) {
      updateAttendanceRecord(selectedRecord.id, editFormData);
      
      toast({
        title: "Registro atualizado",
        description: `O registro de ${editFormData.name} foi atualizado com sucesso.`,
      });
      
      setIsEditDialogOpen(false);
      onAttendanceUpdated();
    }
  };

  const handleMarkAsAttended = (id: string) => {
    if (markAsAttended(id)) {
      toast({
        title: "Atendimento realizado",
        description: "O registro foi marcado como atendido.",
      });
      onAttendanceUpdated();
    }
  };

  const handleDelete = (id: string) => {
    if (deleteAttendanceRecord(id)) {
      toast({
        title: "Registro excluído",
        description: "O registro foi excluído com sucesso.",
      });
      onAttendanceUpdated();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <>
      <div className="rounded-md border bg-card text-card-foreground shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Matrícula</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead className="w-[150px]">Data e Hora</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.registration}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.position}</TableCell>
                  <TableCell>{record.sector}</TableCell>
                  <TableCell>{formatDate(record.createdAt)}</TableCell>
                  <TableCell>
                    {record.attended ? (
                      <Badge variant="outline" className="bg-success/20 text-success">Atendido</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">Em Espera</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!record.attended && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleMarkAsAttended(record.id)}
                          disabled={!canEdit}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditClick(record)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Registro de Atendimento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="registration">Matrícula</Label>
              <Input
                id="registration"
                name="registration"
                value={editFormData.registration}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                name="position"
                value={editFormData.position}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sector">Setor</Label>
              <Select value={editFormData.sector} onValueChange={handleEditSelectChange}>
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
                value={editFormData.reason}
                onChange={handleEditChange}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">Atualizar Registro</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
