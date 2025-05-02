
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { validatePermission } from "@/lib/auth";
import { Attendance } from "@/lib/types";
import { updateAttendanceRecord, markAsAttended, deleteAttendanceRecord } from "@/lib/attendanceService";
import { AttendanceStatus } from "./AttendanceStatus";
import { AttendanceActions } from "./AttendanceActions";
import { EditAttendanceDialog } from "./EditAttendanceDialog";

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
        description: "O registro foi marcado como atendido e será ocultado em 40 segundos.",
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
                    <AttendanceStatus 
                      attended={record.attended}
                      attendedAt={record.attendedAt}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <AttendanceActions 
                      id={record.id}
                      attended={record.attended}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onEditClick={() => handleEditClick(record)}
                      onMarkAsAttended={() => handleMarkAsAttended(record.id)}
                      onDelete={() => handleDelete(record.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditAttendanceDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedRecord={selectedRecord}
        editFormData={editFormData}
        onEditChange={handleEditChange}
        onEditSelectChange={handleEditSelectChange}
        onSubmit={handleEditSubmit}
      />
    </>
  );
};
