import React from "react";
import { PlusCircle, Trash2, Upload, RefreshCw } from "lucide-react";
import { cn } from "../../../utils/cn";

interface ManagementButtonsProps {
  onAdd?: () => void;
  onDelete?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  isExporting?: boolean;
  className?: string;
  addLabel?: string;
  deleteLabel?: string;
  importLabel?: string;
  exportLabel?: string;
  refreshLabel?: string;
  disabledAdd?: boolean;
  disabledDelete?: boolean;
  disabledImport?: boolean;
  disabledExport?: boolean;
  disabledRefresh?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const ManagementButtons: React.FC<ManagementButtonsProps> = ({
  onAdd,
  onDelete,
  onImport,
  onExport,
  onRefresh,
  isExporting,
  className,
  addLabel = "Add",
  deleteLabel = "Delete",
  importLabel = "Import",
  exportLabel = "Export",
  refreshLabel = "Refresh",
  disabledAdd,
  disabledDelete,
  disabledImport,
  disabledExport,
  disabledRefresh,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          disabled={disabledAdd}
          className={cn(
            "inline-flex items-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "bg-green-600 text-white hover:bg-green-700",
            disabledAdd && "opacity-50 cursor-not-allowed"
          )}
        >
          <PlusCircle className="mr-2" size={iconSize} />
          {addLabel}
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabledDelete}
          className={cn(
            "inline-flex items-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "bg-red-500 text-white hover:bg-red-700",
            disabledDelete && "opacity-50 cursor-not-allowed"
          )}
        >
          <Trash2 className="mr-2" size={iconSize} />
          {deleteLabel}
        </button>
      )}
      {onImport && (
        <button
          type="button"
          onClick={onImport}
          disabled={disabledImport}
          className={cn(
            "inline-flex items-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "border border-gray-300 focus:ring-2 focus:ring-gray-400",
            "bg-white text-black hover:bg-gray-100",
            disabledImport && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="mr-2" size={iconSize} />
          {importLabel}
        </button>
      )}
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className={cn(
            "inline-flex items-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "border border-gray-300 focus:ring-2 focus:ring-gray-400",
            "bg-white text-black hover:bg-gray-100",
            disabledExport && "opacity-50 cursor-not-allowed"
          )}
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Upload style={{ color: "black" }} size={iconSize} />
          )}
          {isExporting ? "Exporting..." : exportLabel}
        </button>
      )}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={disabledRefresh}
          className={cn(
            "inline-flex items-center rounded-md font-medium transition-colors focus:outline-none",
            sizeClasses[size],
            "border border-gray-300 focus:ring-2 focus:ring-gray-400",
            "bg-white text-black hover:bg-gray-100",
            disabledRefresh && "opacity-50 cursor-not-allowed"
          )}
        >
          <RefreshCw className="mr-2" size={iconSize} />
          {refreshLabel}
        </button>
      )}
    </div>
  );
};

export default ManagementButtons;
