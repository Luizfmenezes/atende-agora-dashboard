
import { Badge } from "@/components/ui/badge";

interface AttendanceStatusProps {
  attended: boolean;
}

export const AttendanceStatus = ({ attended }: AttendanceStatusProps) => {
  return attended ? (
    <Badge variant="outline" className="bg-success/20 text-success">Atendido</Badge>
  ) : (
    <Badge variant="outline" className="bg-muted text-muted-foreground">Em Espera</Badge>
  );
};
