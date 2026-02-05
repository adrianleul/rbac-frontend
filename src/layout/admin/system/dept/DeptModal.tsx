import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Department } from "../../../../types/dept";
import DepartmentTreeSelect from "../../../../components/ui/admin/Department";
import { Input } from '../../../../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newDept: Department) => void;
  departments: Department[];
  initialParentId?: number;
  editingDept?: Department | null;
}

const initialFormState = {
  parentId: 0,
  deptName: "",
  orderNum: "",
  leader: "",
  phone: "",
  email: "",
  status: "0",
};

const DepartmentModal = ({ isOpen, onClose, onSubmit, departments, initialParentId, editingDept }: Props) => {
  const [formState, setFormState] = useState(initialFormState);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      if (editingDept) {
        setFormState({
          parentId: editingDept.parentId,
          deptName: editingDept.deptName,
          orderNum: editingDept.orderNum.toString(),
          leader: editingDept.leader,
          phone: editingDept.phone,
          email: editingDept.email,
          status: editingDept.status,
        });
      } else {
        setFormState((prev) => ({
          ...initialFormState,
          parentId: initialParentId ?? 0,
        }));
      }
    }
  }, [isOpen, initialParentId, editingDept]);

  const handleDepartmentChange = (deptId: number | null, deptName?: string) => {
    setFormState((prev) => ({
      ...prev,
      parentId: deptId ?? 0, // fallback to 0 if null
    }));
    // Optionally log or do something with deptName
  };
  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const renderDeptOptions = (items: Department[], level = 0): JSX.Element[] => {
    return items.flatMap((dept) => {
      const isExpanded = expanded.has(dept.deptId);
      const hasChildren = dept.children && dept.children.length > 0;

      const childrenElements =
        isExpanded && hasChildren
          ? renderDeptOptions(dept.children!, level + 1)
          : [];

      return [
        <div
          key={dept.deptId}
          className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-100`}
          style={{ paddingLeft: `${level * 16}px` }} // same as pl-{level * 4}
        >
          {/* Expand/Collapse Toggle */}
          {hasChildren ? (
            <span
              className="mr-1"
              onClick={(e) => {
                e.stopPropagation(); // prevent selecting when toggling
                toggleExpand(dept.deptId);
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          ) : (
            <span className="w-4 mr-1" /> // placeholder to align
          )}

          {/* Select Department */}
          <span
            onClick={() => {
              setFormState((prev) => ({ ...prev, parentId: dept.deptId }));
            }}
            className={`flex-1 ${formState.parentId === dept.deptId ? "font-semibold bg-gray-200 rounded px-1" : ""}`}
          >
            {dept.deptName}
          </span>
        </div>,
        ...childrenElements,
      ];
    });
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const dept: Department = {
      deptId: editingDept ? editingDept.deptId : Date.now(),
      parentId: formState.parentId,
      deptName: formState.deptName,
      orderNum: parseInt(formState.orderNum || "0", 10),
      leader: formState.leader,
      phone: formState.phone,
      email: formState.email,
      status: formState.status,
      createTime: editingDept ? editingDept.createTime : new Date().toISOString(),
      ancestors: editingDept ? editingDept.ancestors : "",
      delFlag: editingDept ? editingDept.delFlag : "0",
      remark: editingDept ? editingDept.remark : undefined,
      parentName: editingDept ? editingDept.parentName : undefined,
      children: editingDept ? editingDept.children : undefined,
    };
    onSubmit(dept);
    setFormState(initialFormState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full" footer={null}>
        <DialogHeader>
          <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
        </DialogHeader>
        <div className="col-span-2 mb-4">
          <label className="block mb-1 font-medium">Select Parent Department</label>
          <DepartmentTreeSelect
            value={formState.parentId}
            onChange={handleDepartmentChange}
            placeholder="Select a department"
            allowClear={true}
            size="md"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Department Name</label>
            <Input
              type="text"
              name="deptName"
              value={formState.deptName}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Order Number</label>
            <Input
              type="number"
              name="orderNum"
              value={formState.orderNum}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Leader</label>
            <Input
              type="text"
              name="leader"
              value={formState.leader}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <Input
              type="text"
              name="phone"
              value={formState.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <RadioGroup
              name="status"
              value={formState.status}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value }))}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="0" id="status-active" />
                <label htmlFor="status-active" className="text-sm">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1" id="status-inactive" />
                <label htmlFor="status-inactive" className="text-sm">Inactive</label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter className="mt-6 flex flex-col items-end gap-2">
          {!formState.parentId && (
            <div className="text-red-500 text-sm mb-2">Please select a parent department.</div>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              disabled={!formState.parentId}
            >
              Submit
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentModal;
