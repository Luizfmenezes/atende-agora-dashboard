
import { Badge } from "@/components/ui/badge";

interface AttendanceStatusProps {
  attended: boolean;
  attendedAt?: string;
}

export const AttendanceStatus = ({ attended, attendedAt }: AttendanceStatusProps) => {
  return attended ? (
    <Badge variant="outline" className="bg-success/20 text-success">
      Atendido {attendedAt && `em ${new Date(attendedAt).toLocaleString('pt-BR')}`}
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-muted text-muted-foreground">Em Espera</Badge>
  );
};
