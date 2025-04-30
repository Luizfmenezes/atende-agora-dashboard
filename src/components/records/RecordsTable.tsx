
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Attendance } from "@/lib/types";
import { FileExcel } from "lucide-react";
import * as XLSX from "xlsx";

interface RecordsTableProps {
  records: Attendance[];
}

export const RecordsTable = ({ records }: RecordsTableProps) => {
  const exportToExcel = () => {
    // Transformar dados para o formato de exportação
    const exportData = records.map(record => ({
      ID: record.id,
      Matrícula: record.registration,
      Nome: record.name,
      Cargo: record.position,
      Setor: record.sector,
      "Motivo do Atendimento": record.reason,
      "Data e Hora": format(new Date(record.createdAt), "dd/MM/yyyy HH:mm"),
      Status: record.attended ? "Atendido" : "Em Espera"
    }));

    // Criar workbook e adicionar worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Adicionar a worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    
    // Gerar arquivo e fazer download
    const fileName = `registros_atendimento_${format(new Date(), "dd_MM_yyyy")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={exportToExcel}
          disabled={records.length === 0}
        >
          <FileExcel className="mr-2 h-4 w-4" /> Exportar para Excel
        </Button>
      </div>
      
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
