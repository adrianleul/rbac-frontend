import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useState, ChangeEvent } from "react";
import { addConfig } from "../../../../api/system/config";

type Parameter = {
    createBy?: string;
    createTime: string;
    updateBy?: string;
    updateTime?: string | null;
    remark: string;
    configId: number;
    configName: string;
    configKey: string;
    configValue: string;
    configType: string;
};

interface AddConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddConfigurationModal: React.FC<AddConfigurationModalProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<Parameter>>({
    configName: "",
    configKey: "",
    configValue: "",
    configType: "N",
    remark: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof Parameter, value: string) => {
    setFormData((prev: Partial<Parameter>) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.configName || !formData.configKey || !formData.configValue) {
      alert("Please fill all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Prepare payload for API (exclude configId, createTime)
      const payload = {
        configName: formData.configName,
        configKey: formData.configKey,
        configValue: formData.configValue,
        configType: formData.configType,
        remark: formData.remark,
      };
      const res = await addConfig(payload);
      if (res && res.code === 200) {
        onSuccess();
        onClose();
        setFormData({ configName: "", configKey: "", configValue: "", configType: "N", remark: "" });
      } else {
        alert(res?.msg || "Failed to add configuration.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to add configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent footer={null} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Configuration</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Input
            placeholder="Configuration Name"
            value={formData.configName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("configName", e.target.value)}
          />
          <Input
            placeholder="Configuration Key"
            value={formData.configKey}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("configKey", e.target.value)}
          />
          <Input
            placeholder="Configuration Value"
            value={formData.configValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("configValue", e.target.value)}
          />
          <Select
            value={formData.configType}
            onValueChange={(value) => handleChange("configType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Is System Built-in?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">Yes</SelectItem>
              <SelectItem value="N">No</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Remark"
            value={formData.remark}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange("remark", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddConfigurationModal;
