import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../../components/ui/radio-group";
import { Checkbox } from "../../../../components/ui/checkbox";
import { treeselect, roleMenuTreeselect } from "../../../../api/system/menu";
import { addRole, updateRole, getRole } from "../../../../api/system/role";
import { Textarea } from "../../../../components/ui/textarea";
import { useToast, toast } from "../../../../components/alert/Toast";

interface RoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (success: boolean, message: string) => void;
  selectedRole?: { roleId: number } | null;
}

type Menu = {
  id: number;
  label: string;
  disabled?: boolean;
  children?: Menu[];
};

export default function RoleModal({
  open,
  onOpenChange,
  onSave,
  selectedRole = null,
}: RoleModalProps) {
  const { showToast } = useToast();
  const [roleName, setRoleName] = useState("");
  const [roleKey, setRoleKey] = useState("");
  const [roleSort, setRoleSort] = useState(0);
  const [status, setStatus] = useState("0");
  const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [remark, setRemark] = useState("");
  const [selectionMode, setSelectionMode] = useState<"all" | "single">("all");
  const isEdit = !!selectedRole;

  const resetForm = () => {
    setRoleName("");
    setRoleKey("");
    setRoleSort(0);
    setStatus("0");
    setCheckedKeys([]);
    setExpandedMenus([]);
    setRemark("");
    setSelectionMode("all");
  };

  const toggleExpand = useCallback((id: number) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const findMenuNodeById = useCallback((nodes: Menu[], targetId: number): Menu | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children && node.children.length) {
        const found = findMenuNodeById(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const getAllDescendantIds = useCallback((node: Menu | null): number[] => {
    if (!node || !node.children || !node.children.length) return [];
    const ids: number[] = [];
    const stack: Menu[] = [...node.children];
    while (stack.length) {
      const current = stack.pop()!;
      ids.push(current.id);
      if (current.children && current.children.length) {
        stack.push(...current.children);
      }
    }
    return ids;
  }, []);

  const getSelectableDescendantIds = useCallback((node: Menu | null): number[] => {
    if (!node || !node.children || !node.children.length) return [];
    const ids: number[] = [];
    const stack: Menu[] = [...node.children];
    while (stack.length) {
      const current = stack.pop()!;
      if (!current.disabled) ids.push(current.id);
      if (current.children && current.children.length) {
        stack.push(...current.children);
      }
    }
    return ids;
  }, []);

  const handleCheckboxChange = useCallback((id: number, checked: boolean) => {
    setCheckedKeys((prev) => {
      const set = new Set(prev);
      if (checked) {
        set.add(id);
      } else {
        set.delete(id);
      }

      if (selectionMode === "all") {
        const node = findMenuNodeById(menus, id);
        if (checked) {
          const selectableIds = getSelectableDescendantIds(node);
          for (const childId of selectableIds) {
            set.add(childId);
          }
        } else {
          const allIds = getAllDescendantIds(node);
          for (const childId of allIds) {
            set.delete(childId);
          }
        }
      }

      return Array.from(set);
    });
  }, [menus, selectionMode, findMenuNodeById, getAllDescendantIds, getSelectableDescendantIds]);

  const handleSave = async () => {
    if (!roleName.trim()) {
      showToast(toast.error('Role name cannot be empty'));
      return;
    }
    if (!roleKey.trim()) {
      showToast(toast.error('Permission key cannot be empty'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roleName,
        roleKey,
        roleSort,
        status,
        menuIds: checkedKeys,
        remark,
      };
      let res;
      if (isEdit && selectedRole) {
        res = await updateRole({ ...payload, roleId: selectedRole.roleId });
      } else {
        res = await addRole(payload);
      }
      const code = res?.code;
      const msg = res?.msg;
      if (code === 200) {
        showToast(toast.success(isEdit ? "Role updated successfully" : "Role created successfully"));
        onSave(true, isEdit ? "Role updated successfully" : "Role created successfully");
        resetForm();
        onOpenChange(false);
      } else {
        showToast(toast.error(msg || (isEdit ? "Failed to update role" : "Failed to create role")));
        onSave(false, msg || (isEdit ? "Failed to update role" : "Failed to create role"));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : (isEdit ? "Failed to update role" : "Failed to create role");
      showToast(toast.error(msg));
      onSave(false, msg);
    } finally {
      setLoading(false);
    }
  };

  const renderMenuNode = (menu: Menu): JSX.Element => {
    const isExpanded = expandedMenus.includes(menu.id);
    const isChecked = checkedKeys.includes(menu.id);
    const isDisabled = menu.disabled;
    const hasChildren = !!menu.children?.length;

    return (
      <div key={menu.id} className="pl-2">
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpand(menu.id)}
              className="text-sm text-gray-600"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          )}
          <Checkbox
            checked={isChecked}
            onChange={(e) => handleCheckboxChange(menu.id, e.target.checked)}
            disabled={isDisabled}
          />
          <span className={isDisabled ? "text-gray-400" : "text-black"}>
            {menu.label}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="pl-4 border-l border-gray-300 ml-2">
            {menu.children!.map(renderMenuNode)}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (open) {
      if (isEdit && selectedRole) {
        setLoading(true);
        const roleIdStr = String(selectedRole.roleId);
        treeselect().then((treeRes) => {
          setMenus(treeRes.data || []);
          Promise.all([
            getRole(roleIdStr),
            roleMenuTreeselect(roleIdStr)
          ]).then(([roleRes, menuRes]) => {
            const role = roleRes.data || {};
            setRoleName(role.roleName || "");
            setRoleKey(role.roleKey || "");
            setRoleSort(role.roleSort || 0);
            setStatus(role.status?.toString() || "0");
            setRemark(role.remark || "");
            setCheckedKeys(menuRes.checkedKeys);
          }).finally(() => setLoading(false));
        });
      } else {
        resetForm();
        treeselect().then((res) => {
          setMenus(res.data || []);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEdit, selectedRole?.roleId]);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[100vh]" footer={null} style={{ top: 24 }} width={1000}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Add Role"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Role Name</Label>
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Permission Key</Label>
            <Input
              value={roleKey}
              onChange={(e) => setRoleKey(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Role Sort</Label>
            <Input
              type="number"
              value={roleSort}
              onChange={(e) => setRoleSort(Number(e.target.value))}
              disabled={loading}
            />
          </div>
          <div>
            <Label>Status</Label>
            <RadioGroup
              value={status}
              onValueChange={setStatus}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="active" />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="inactive" />
                <Label htmlFor="inactive">Inactive</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="mt-2">
              <RadioGroup
                value={selectionMode}
                onValueChange={(v) => setSelectionMode(v as "all" | "single")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="perm-all" />
                  <Label htmlFor="perm-all">Select all</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="perm-single" />
                  <Label htmlFor="perm-single">Select one by one</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded p-2">
              {Array.isArray(menus)
                ? (menus.length > 0
                  ? menus.map(renderMenuNode)
                  : <span className="text-gray-400">No permissions available</span>
                )
                : <span className="text-gray-400">No permissions available</span>
              }
            </div>
          </div>
          <div>
            <Label>Remark</Label>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={loading}
              rows={3}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Enter any notes or remarks here..."
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="flex-1" onClick={handleSave} disabled={loading}>
              {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Role" : "Create Role")}
            </Button>
            <Button className="flex-1" variant="outline" onClick={resetForm} disabled={loading}>
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
