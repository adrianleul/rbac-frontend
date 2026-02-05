import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useState, useEffect, ChangeEvent } from "react";
import { updateConfig, getConfig } from "../../../../api/system/config";

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

interface EditConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: (updated: Parameter) => void;
  initialData: Parameter | null;
}

const isParameter = (obj: any): obj is Parameter => {
  return obj && typeof obj === "object" &&
    "configId" in obj &&
    "configName" in obj &&
    "configKey" in obj &&
    "configValue" in obj;
};

const EditConfigurationModal: React.FC<EditConfigurationModalProps> = ({
  open,
  onClose,
  onEdit,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Parameter>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  const handleChange = (field: keyof Parameter, value: string) => {
    setFormData((prev: Partial<Parameter>) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.configId ||
      !formData.configName ||
      !formData.configKey ||
      !formData.configValue
    ) {
      alert("Please fill all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      // Ensure all required fields are sent
      const payload = {
        configId: formData.configId,
        configName: formData.configName,
        configKey: formData.configKey,
        configValue: formData.configValue,
        configType: formData.configType || "N",
        remark: formData.remark || "",
      };
      console.log("Updating config with payload:", payload);
      await updateConfig(payload);
      // Fetch the latest config data by configId
      const latest = await getConfig(String(formData.configId));
      let config: Parameter | null = null;
      if (latest && typeof latest === "object" && "data" in latest && isParameter((latest as any).data)) {
        config = (latest as any).data;
      }
      if (config) {
        onEdit(config);
        onClose();
      } else {
        alert("Failed to fetch updated configuration.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent footer={null} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Configuration</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Input
            placeholder="Configuration Name"
            value={formData.configName || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("configName", e.target.value)}
          />
          <Input
            placeholder="Configuration Key"
            value={formData.configKey || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("configKey", e.target.value)}
          />
          <Input
            placeholder="Configuration Value"
            value={formData.configValue || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("configValue", e.target.value)}
          />
          <Select
            value={formData.configType || "N"}
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
            value={formData.remark || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange("remark", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditConfigurationModal;
