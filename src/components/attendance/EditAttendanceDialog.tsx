
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Attendance } from "@/lib/types";

interface EditAttendanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecord: Attendance | null;
  editFormData: Partial<Attendance>;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onEditSelectChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditAttendanceDialog = ({
  isOpen,
  onOpenChange,
  selectedRecord,
  editFormData,
  onEditChange,
  onEditSelectChange,
  onSubmit
}: EditAttendanceDialogProps) => {
  return (                  
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Registro de Atendimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="registration">Matrícula</Label>
            <Input
              id="registration"
              name="registration"
              value={editFormData.registration}
              onChange={onEditChange}
              required
            />
          </div>
              
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={editFormData.name}
              onChange={onEditChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              name="position"
              value={editFormData.position}
              onChange={onEditChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Select value={editFormData.sector} onValueChange={onEditSelectChange}>
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
              onChange={onEditChange}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit">Atualizar Registro</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
