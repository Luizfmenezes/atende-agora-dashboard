
import { Button } from "@/components/ui/button";
import { Pencil, CheckCircle, Trash2 } from "lucide-react";

interface AttendanceActionsProps {
  id: string;
  attended: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEditClick: () => void;
  onMarkAsAttended: () => void;
  onDelete: () => void;
}

export const AttendanceActions = ({
  id,
  attended,
  canEdit,
  canDelete,
  onEditClick,
  onMarkAsAttended,
  onDelete
}: AttendanceActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      {!attended && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onMarkAsAttended}
          disabled={!canEdit}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}
      
      {canEdit && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onEditClick}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      
      {canDelete && (
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
