
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllSectorPhones, addPhoneNumberToSector, removePhoneNumberFromSector } from "@/lib/whatsappService";
import { Phone, Plus, Trash2 } from "lucide-react";

export const SectorPhoneManagement = () => {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedSector, setSelectedSector] = useState<"RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO">("RH");
  const [sectorPhones, setSectorPhones] = useState(getAllSectorPhones());
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.trim() === "") {
      toast({
        title: "Erro",
        description: "Por favor, informe um número de telefone válido",
        variant: "destructive",
      });
      return;
    }

    addPhoneNumberToSector(selectedSector, phoneNumber);
    
    toast({
      title: "Número adicionado",
      description: `Número ${phoneNumber} foi adicionado ao setor ${selectedSector}`,
    });
    
    setPhoneNumber("");
    setSectorPhones(getAllSectorPhones());
    setOpen(false);
  };

  const handleRemove = (sector: "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO", numberId: string) => {
    if (removePhoneNumberFromSector(sector, numberId)) {
      setSectorPhones(getAllSectorPhones());
      toast({
        title: "Número removido",
        description: "O número de telefone foi removido com sucesso",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover o número de telefone",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Números de WhatsApp por Setor</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Número de WhatsApp
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Número de WhatsApp</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Setor</Label>
                <Select 
                  value={selectedSector} 
                  onValueChange={(value) => setSelectedSector(value as "RH" | "DISCIPLINA" | "DP" | "PLANEJAMENTO")}
                >
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
                <Label htmlFor="phoneNumber">Número de WhatsApp</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+55 (99) 99999-9999"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Digite o número com código de país. Ex: +5511999999999
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit">Adicionar Número</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setor</TableHead>
                <TableHead>Número</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectorPhones.map((sectorPhone) => (
                sectorPhone.phoneNumbers.length > 0 ? (
                  sectorPhone.phoneNumbers.map((number) => (
                    <TableRow key={`${sectorPhone.sector}-${number.id}`}>
                      <TableCell>{sectorPhone.sector}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          {number.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemove(sectorPhone.sector, number.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key={sectorPhone.sector}>
                    <TableCell>{sectorPhone.sector}</TableCell>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhum número cadastrado
                    </TableCell>
                  </TableRow>
                )
              ))}
              
              {sectorPhones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhum número cadastrado para qualquer setor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
