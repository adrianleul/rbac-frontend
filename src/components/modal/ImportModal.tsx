import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import request, { download } from "../../utils/request";
import { useToast, toast } from "../alert/Toast";

interface ImportModalProps {
    open: boolean;
    title: string;
    downloadTemplateUrl: string;
    updateLabel: string;
    uploadUrl: string;
    onClose: () => void;
    onSuccess?: () => void;
  }
  
  export const ImportModal: React.FC<ImportModalProps> = ({
    open,
    title,
    downloadTemplateUrl,
    updateLabel,
    uploadUrl,
    onClose,
    onSuccess,
  }) => {
    const [file, setFile] = useState<File | null>(null);
    const [updateSupport, setUpdateSupport] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (
        selected &&
        (selected.name.endsWith(".xls") || selected.name.endsWith(".xlsx"))
      ) {
        setFile(selected);
      }
    };
  
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (
        dropped &&
        (dropped.name.endsWith(".xls") || dropped.name.endsWith(".xlsx"))
      ) {
        setFile(dropped);
      }
    };

    const { showToast } = useToast();
  
    const handleUpload = async () => {
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
  
      setLoading(true);
      try {
        await request.post(`${uploadUrl}?updateSupport=${updateSupport}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (onSuccess) onSuccess();
        setFile(null);
        onClose();
      } catch (err) {
        showToast(toast.error('Failed to upload file.'));
      } finally {
        setLoading(false);
      }
    };
  
    const handleDownloadTemplate = async () => {
      const urlParts = downloadTemplateUrl.split('/');
      let filename = urlParts[urlParts.length - 1] || 'template.xlsx';
      if (!filename.includes('.')) filename = 'template.xlsx';
      try {
        await download(downloadTemplateUrl, {}, filename);
        showToast(toast.success('Template downloaded successfully!'));
      } catch (err) {
        showToast(toast.error('Failed to download template.'));
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent footer={null}>
        <DialogTitle>{title}</DialogTitle>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput")?.click()}
            className={
              "border border-dashed rounded-lg p-6 text-center cursor-pointer " +
              (!file ? "hover:bg-muted" : "bg-muted")
            }
          >
            {!file ? (
              <>
                <p className="text-sm text-gray-500">
                  Drag and drop file here or click to select
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Only .xls and .xlsx formats allowed
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <span>{file.name}</span>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  ×
                </Button>
              </div>
            )}
          </div>
  
          <input
            id="fileInput"
            type="file"
            accept=".xls,.xlsx"
            hidden
            onChange={handleFileChange}
          />
  
          <div className="flex items-center gap-2 mt-4">
            <Checkbox
              id="updateCheckbox"
              checked={updateSupport}
              onChange={e => setUpdateSupport(e.target.checked)}
            />
            <label htmlFor="updateCheckbox" className="text-sm">
              {updateLabel}
            </label>
          </div>
  
          <div className="mt-2 text-sm text-blue-600 underline">
            <button type="button" onClick={handleDownloadTemplate} className="underline text-blue-600 hover:text-blue-800">
              Download Template
            </button>
          </div>
          <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!file || loading}
            onClick={handleUpload}
          >
            {loading ? "Uploading..." : "OK"}
          </Button>
        </DialogFooter>
        </DialogContent>      
      </Dialog>
    );
  };