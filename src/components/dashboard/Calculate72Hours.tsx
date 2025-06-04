
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calculator } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const Calculate72Hours = () => {
  const [attestDate, setAttestDate] = useState("");
  const [attestTime, setAttestTime] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const calculateHoursDifference = () => {
    if (!attestDate || !attestTime || !deliveryDate || !deliveryTime) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      const attestDateTime = new Date(`${attestDate}T${attestTime}`);
      const deliveryDateTime = new Date(`${deliveryDate}T${deliveryTime}`);

      if (isNaN(attestDateTime.getTime()) || isNaN(deliveryDateTime.getTime())) {
        toast({
          title: "Erro",
          description: "Data ou hora inválida",
          variant: "destructive",
        });
        return;
      }

      if (deliveryDateTime < attestDateTime) {
        toast({
          title: "Erro",
          description: "A data de entrega não pode ser anterior à data do atestado",
          variant: "destructive",
        });
        return;
      }

      const differenceInMs = deliveryDateTime.getTime() - attestDateTime.getTime();
      const differenceInHours = differenceInMs / (1000 * 60 * 60);

      const hours = Math.floor(differenceInHours);
      const minutes = Math.floor((differenceInHours - hours) * 60);

      const isWithin72Hours = differenceInHours <= 72;

      setResult(
        `Tempo decorrido: ${hours}h ${minutes}min\n${
          isWithin72Hours 
            ? "✅ Dentro do prazo de 72 horas" 
            : "❌ Excedeu o prazo de 72 horas"
        }`
      );

      toast({
        title: isWithin72Hours ? "Dentro do prazo" : "Prazo excedido",
        description: `${hours}h ${minutes}min decorridos`,
        variant: isWithin72Hours ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao calcular a diferença de tempo",
        variant: "destructive",
      });
    }
  };

  const clearForm = () => {
    setAttestDate("");
    setAttestTime("");
    setDeliveryDate("");
    setDeliveryTime("");
    setResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Calculator className="mr-2 h-5 w-5" />
          Cálculo 72h
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cálculo de 72 Horas</DialogTitle>
          <DialogDescription>
            Calcule se o atestado foi entregue dentro do prazo de 72 horas
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attest-date">Data do Atestado</Label>
              <Input
                id="attest-date"
                type="date"
                value={attestDate}
                onChange={(e) => setAttestDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attest-time">Hora do Atestado</Label>
              <Input
                id="attest-time"
                type="time"
                value={attestTime}
                onChange={(e) => setAttestTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Data de Entrega</Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-time">Hora de Entrega</Label>
              <Input
                id="delivery-time"
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>
          </div>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={clearForm}>
            Limpar
          </Button>
          <Button onClick={calculateHoursDifference}>
            Calcular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
