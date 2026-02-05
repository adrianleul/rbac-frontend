import React from "react";
import { ScanEye, SquarePen, Trash2, PlusCircle } from "lucide-react";
import { cn } from "../../../utils/cn";

export interface OperationButtonsProps {
  onView?: () => void;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTitle?: string;
  addTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  disabledView?: boolean;
  disabledAdd?: boolean;
  disabledEdit?: boolean;
  disabledDelete?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const OperationButtons: React.FC<OperationButtonsProps> = ({
  onView,
  onAdd,
  onEdit,
  onDelete,
  viewTitle = "View",
  addTitle = "Add",
  editTitle = "Edit",
  deleteTitle = "Delete",
  disabledView,
  disabledAdd,
  disabledEdit,
  disabledDelete,
  size = 'md',
  className,
}) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 24 : 20;

  return (
    <div className={cn("flex gap-2 ", className)}>
      {onView && (
        <button
          type="button"
          onClick={onView}
          disabled={disabledView}
          title={viewTitle}
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "bg-green-200 hover:bg-green-400",
            disabledView && "opacity-50 cursor-not-allowed"
          )}
        >
          <ScanEye style={{color: "green"}} size={iconSize} />
        </button>
      )}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          disabled={disabledAdd}
          title={addTitle}
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "bg-green-200 hover:bg-green-400",
            disabledAdd && "opacity-50 cursor-not-allowed"
          )}
        >
          <PlusCircle style={{color: "green"}} size={iconSize} />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={disabledEdit}
          title={editTitle}
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "bg-blue-100 text-white hover:bg-blue-300",
            disabledEdit && "opacity-50 cursor-not-allowed"
          )}
        >
          <SquarePen style={{ color: 'blue'}} size={iconSize} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabledDelete}
          title={deleteTitle}
          className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "bg-red-100 hover:bg-red-300",
            disabledDelete && "opacity-50 cursor-not-allowed"
          )}
        >
          <Trash2 style={{color: "red"}} size={iconSize} />
        </button>
      )}
    </div>
  );
};

export default OperationButtons;
