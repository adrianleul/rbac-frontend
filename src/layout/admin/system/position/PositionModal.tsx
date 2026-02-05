import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Textarea } from "../../../../components/ui/textarea";

type Position = {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: string; // "0" or "1"
  createTime: string;
  remark?: string;
};

type EditPositionModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (updatedPosition: Position) => void;
  position: Position | null;
};

const PositionModal: React.FC<EditPositionModalProps> = ({ open, onClose, onSave, position }) => {
  const isEdit = !!position;
  const [formData, setFormData] = useState<Position>({
    postId: 0,
    postCode: "",
    postName: "",
    postSort: 0,
    status: "0",
    remark: "",
    createTime: "",
  });

  useEffect(() => {
    if (position) {
      setFormData(position);
    } else {
      setFormData({
        postId: 0,
        postCode: "",
        postName: "",
        postSort: 0,
        status: "0",
        remark: "",
        createTime: "",
      });
    }
  }, [position]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      setFormData({
        postId: 0,
        postCode: "",
        postName: "",
        postSort: 0,
        status: "0",
        remark: "",
        createTime: "",
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "postSort" ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ top: 94 }} width={500} footer={null}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Position" : "Add Position"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="postName">Job Title</Label>
            <Input id="postName" name="postName" value={formData.postName} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="postCode">Position Code</Label>
            <Input id="postCode" name="postCode" value={formData.postCode} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="postSort">Sorting</Label>
            <Input
              id="postSort"
              name="postSort"
              type="number"
              value={formData.postSort}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="status">Status</Label>
            <RadioGroup
              name="status"
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as '0' | '1' }))}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="0" id="edit-position-status-active" />
                <label htmlFor="edit-position-status-active" className="text-sm">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1" id="edit-position-status-inactive" />
                <label htmlFor="edit-position-status-inactive" className="text-sm">Inactive</label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              name="remark"
              placeholder="Remark (Optional)"
              value={formData.remark}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PositionModal;
