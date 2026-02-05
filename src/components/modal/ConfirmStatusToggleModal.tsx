import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ConfirmStatusToggleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  currentStatus: string;
  itemName?: string;
  isLoading?: boolean;
}

const ConfirmStatusToggleModal: React.FC<ConfirmStatusToggleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  currentStatus,
  itemName = "item",
  isLoading = false,
}) => {
  const isActive = currentStatus === "0";
  const newStatus = isActive ? "1" : "0";
  const statusText = isActive ? "deactivate" : "activate";
  const statusColor = isActive ? "text-red-600" : "text-green-600";
  const statusIcon = isActive ? XCircle : CheckCircle;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent footer={null} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className={`mt-1 ${statusColor}`}>
              {React.createElement(statusIcon, { className: "w-5 h-5" })}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">{message}</p>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Current Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="font-medium">New Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    newStatus === "0" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {newStatus === "0" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`min-w-[80px] ${
                isActive 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {statusText === "deactivate" ? "Deactivating..." : "Activating..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {React.createElement(statusIcon, { className: "w-4 h-4" })}
                  {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmStatusToggleModal; 