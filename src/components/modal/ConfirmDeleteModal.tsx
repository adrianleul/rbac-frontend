import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
  iconColor?: string;
  confirmLabel?: string;
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  isLoading = false,
  iconColor = "text-red-600",
  confirmLabel,
}: ConfirmDeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent footer={null} title={
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className={`h-6 w-6 ${iconColor}`} />
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </div>
      }>
        <div className="text-sm text-gray-700 mb-4">{message}</div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {confirmLabel ? `${confirmLabel}...` : 'Deleting...'}
              </>
            ) : (
              confirmLabel || 'Delete'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
