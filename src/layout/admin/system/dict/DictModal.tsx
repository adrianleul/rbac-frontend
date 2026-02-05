import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";
import { Input } from '../../../../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import React from "react";

type DictionaryModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd?: (newDict: {
    dictName: string;
    dictType: string;
    status: "0" | "1";
    remark: string;
  }) => Promise<void>;
  onUpdate?: (updatedDict: {
    dictId: number;
    dictName: string;
    dictType: string;
    status: "0" | "1";
    remark: string;
  }) => Promise<void>;
  isLoading?: boolean;
  dictionary?: {
    dictId: number;
    dictName: string;
    dictType: string;
    status: "0" | "1";
    remark: string;
  } | null;
  mode?: "add" | "edit";
};

const DictionaryModal = ({
  open,
  onClose,
  onAdd,
  onUpdate,
  isLoading = false,
  dictionary = null,
  mode = "add",
}: DictionaryModalProps) => {
  const [dictName, setDictName] = useState(dictionary?.dictName || "");
  const [dictType, setDictType] = useState(dictionary?.dictType || "");
  const [status, setStatus] = useState<"0" | "1">(dictionary?.status || "0");
  const [remark, setRemark] = useState(dictionary?.remark || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when dictionary or mode changes
  React.useEffect(() => {
    if (mode === "edit" && dictionary) {
      setDictName(dictionary.dictName || "");
      setDictType(dictionary.dictType || "");
      setStatus(dictionary.status || "0");
      setRemark(dictionary.remark || "");
    } else if (mode === "add") {
      setDictName("");
      setDictType("");
      setStatus("0");
      setRemark("");
    }
    setErrors({});
  }, [dictionary, mode, open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!dictName.trim()) {
      newErrors.dictName = "Dictionary name is required";
    }
    if (!dictType.trim()) {
      newErrors.dictType = "Dictionary type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      if (mode === "edit" && onUpdate && dictionary) {
        await onUpdate({
          dictId: dictionary.dictId,
          dictName: dictName.trim(),
          dictType: dictType.trim(),
          status,
          remark: remark.trim(),
        });
      } else if (mode === "add" && onAdd) {
        await onAdd({
          dictName: dictName.trim(),
          dictType: dictType.trim(),
          status,
          remark: remark.trim(),
        });
      }
      // Reset form on successful submission
      if (mode === "add") {
        setDictName("");
        setDictType("");
        setStatus("0");
        setRemark("");
      }
      setErrors({});
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Error in modal:", error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setDictName("");
      setDictType("");
      setStatus("0");
      setRemark("");
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" footer={null}>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Dictionary" : "Add Dictionary"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              placeholder="Dictionary Name"
              value={dictName}
              onChange={(e) => {
                setDictName(e.target.value);
                if (errors.dictName) setErrors(prev => ({ ...prev, dictName: "" }));
              }}
              className={errors.dictName ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.dictName && <p className="text-red-500 text-sm mt-1">{errors.dictName}</p>}
          </div>
          <div>
            <Input
              placeholder="Dictionary Type"
              value={dictType}
              onChange={(e) => {
                setDictType(e.target.value);
                if (errors.dictType) setErrors(prev => ({ ...prev, dictType: "" }));
              }}
              className={errors.dictType ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.dictType && <p className="text-red-500 text-sm mt-1">{errors.dictType}</p>}
          </div>
          <div className="flex items-center gap-4">
            <label>Status:</label>
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as "0" | "1")}
              className="flex gap-4"
              disabled={isLoading}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="0" id="dict-status-active" />
                <label htmlFor="dict-status-active" className="text-sm">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1" id="dict-status-inactive" />
                <label htmlFor="dict-status-inactive" className="text-sm">Inactive</label>
              </div>
            </RadioGroup>
          </div>
          <Textarea
            placeholder="Remark (Optional)"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !dictName.trim() || !dictType.trim()}>
            {isLoading ? (mode === "edit" ? "Updating..." : "Adding...") : (mode === "edit" ? "Update" : "Add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DictionaryModal;
