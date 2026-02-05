import { useState, useEffect } from "react";
import { icons as LucideIcons } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MenuDialog from "./MenuModal";
import {
  ChevronRight,
} from "lucide-react";
import { listMenu, addMenu, updateMenu, getMenu, deleteMenu } from "../../../../api/system/menu";
import { useToast, toast } from "../../../../components/alert/Toast";
import { handleTree } from "../../../../utils/config";
import ManagementButtons from "../../../../components/ui/admin/ManagmentButtons";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import OperationButtons from "../../../../components/ui/admin/OperationButtons";
import { usePermission } from "../../../../utils/usePermisssion";

type Menu = {
  createBy: string | null;
  createTime: string;
  updateBy: string | null;
  updateTime: string | null;
  remark: string | null;
  menuId: number;
  menuName: string;
  parentName: string | null;
  parentId: number;
  orderNum: number;
  path: string;
  component: string | null;
  query: string;
  routeName: string;
  isFrame: "0" | "1"; // assuming only "0" or "1" as string
  isCache: "0" | "1";
  menuType: "M" | "C" | "F"; // M: Module, C: Component, F: Function
  visible: "0" | "1";
  status: "0" | "1";
  perms: string;
  icon: string;
  children: Menu[];
};

const mockDict = {
  type: {
    sys_show_hide: [
      { value: "0", label: "Show" },
      { value: "1", label: "Hide" },
    ],
    sys_normal_disable: [
      { value: "0", label: "Active" },
      { value: "1", label: "Inactive" },
    ],
  },
};

const defaultFormData: Partial<Menu> = {
  parentId: 0,
  menuType: "M",
  icon: "",
  menuName: "",
  orderNum: 0,
  isFrame: "1",
  path: "",
  component: "",
  query: "",
  isCache: "1",
  visible: "0",
  perms: "",
  status: "0",
};

const menuTypeLabels: Record<string, string> = {
  M: "Module",
  C: "Component",
  F: "Function",
};

const MenuPage = () => {
  const { showToast } = useToast();
  //Permission based buttons
  const canAdd = usePermission('system:menu:add');
  const canDelete = usePermission('system:menu:remove');
  const canViewAssignedUsers = usePermission('system:menu:list');
  const canEdit = usePermission('system:menu:edit');
  const showOperateColumn = canEdit || canDelete || canAdd;

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMenuForDelete, setSelectedMenuForDelete] = useState<Menu | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const openDialog = async (menu?: Menu) => {
    if (menu) {
      // Fetch latest menu data before editing
      try {
        const res = await getMenu(menu.menuId.toString());
        const latestMenu = res.data || res;
        setFormData(latestMenu);
        setEditingMenu(latestMenu);
      } catch (err) {
        showToast(toast.error("Failed to fetch latest menu data"));
        setFormData(menu); // fallback to old data
        setEditingMenu(menu);
      }
    } else {
      setFormData(defaultFormData); // Add new
      setEditingMenu(null);
    }
    setDialogOpen(true);
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async (values: Menu) => {
    if (editingMenu) {
      // Edit existing via API
      try {
        setLoading(true);
        await updateMenu(values);
        showToast(toast.success("Menu updated!"));
        // Reload menu list
        const res = await listMenu();
        const data = res.data || res;
        const tree = handleTree(data, "menuId", "parentId", "children") as unknown as Menu[];
        setMenus(Array.isArray(tree) ? tree : []);
      } catch (err: any) {
        showToast(toast.error(err?.msg || err?.message || "Failed to update menu"));
      } finally {
        setLoading(false);
      }
    } else {
      // Add new via API
      try {
        setLoading(true);
        await addMenu(values);
        showToast(toast.success("Menu added!"));
        // Reload menu list
        const res = await listMenu();
        const data = res.data || res;
        const tree = handleTree(data, "menuId", "parentId", "children") as unknown as Menu[];
        setMenus(Array.isArray(tree) ? tree : []);
      } catch (err: any) {
        showToast(toast.error(err?.msg || err?.message || "Failed to add menu"));
      } finally {
        setLoading(false);
      }
    }

    setDialogOpen(false);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const openChildDialog = (parentMenu: Menu) => {
    setFormData({
      ...defaultFormData,
      parentId: parentMenu.menuId,
    });
    setDialogOpen(true);
  };

  const handleDeleteMenu = (menu: Menu) => {
    setSelectedMenuForDelete(menu);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMenuForDelete) return;

    try {
      setIsDeleteLoading(true);
      await deleteMenu(String(selectedMenuForDelete.menuId));
      showToast(toast.success(`Menu "${selectedMenuForDelete.menuName}" deleted successfully!`));
      refreshMenus();
      setIsDeleteOpen(false);
      setSelectedMenuForDelete(null);
    } catch (err: any) {
      showToast(toast.error(err?.msg || err?.message || "Failed to delete menu"));
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedMenuForDelete(null);
    setIsDeleteLoading(false);
  };

  const renderMenus = (items: Menu[], level = 0): JSX.Element[] => {
    return items.flatMap((menu) => {
      const isExpanded = expandedIds.has(menu.menuId);
      const hasChildren = menu.children && menu.children.length > 0;
      const padding = level * 20;
      const IconComponent = LucideIcons[menu.icon as keyof typeof LucideIcons] as LucideIcon;

      return [
        <tr key={menu.menuId} className="text-sm hover:bg-slate-50 text-center">
          <td className=" p-3 border-b border-gray-300 text-left" style={{ paddingLeft: `${padding}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(menu.menuId)}
                  className={`mr-2 w-8 h-8 flex items-center justify-center transition-colors duration-200
                  ${isExpanded ? '' : ''}`}
                  aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
                  tabIndex={0}
                >
                  <span className={`transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                    <ChevronRight size={20} />
                  </span>
                </button>
              )}
              <span>{menu.menuName}</span>
            </div>
          </td>
          <td className=" p-3  border-b border-gray-300">{IconComponent ? <IconComponent className="mx-auto" /> : <LucideIcons.HelpCircle className="mx-auto" />}</td>
          <td className=" p-3  border-b border-gray-300">{menu.orderNum}</td>
          <td className=" p-3  border-b border-gray-300">
            {menuTypeLabels[menu.menuType] || menu.menuType}
          </td>
          <td className=" p-3  border-b border-gray-300">{menu.perms}</td>
          <td className=" p-3  border-b border-gray-300">{menu.component}</td>
          <td className=" p-3  border-b border-gray-300">
            <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${menu.status === "0"
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}>
              {menu.status === "0" ? "Active" : "Inactive"}
            </span>
          </td>
          <td className=" p-3  border-b border-gray-300">{menu.createTime}</td>
          {showOperateColumn && (
            <td className=" p-3 border-b border-gray-300">
              <div className="flex justify-center gap-2">
                <OperationButtons
                  size="sm"
                  addTitle="Add Child Menu"
                  {...(canAdd ? { onAdd: () => openChildDialog(menu) } : {})}
                  editTitle="Edit Menu"
                  {...(canEdit ? { onEdit: () => openDialog(menu) } : {})}
                  deleteTitle="Delete Menu"
                  {...(canDelete ? { onDelete: () => handleDeleteMenu(menu) } : {})}
                />
              </div>
            </td>
          )}
        </tr>,
        ...(isExpanded && menu.children ? renderMenus(menu.children, level + 1) : []),
      ];
    });
  };

  const refreshMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMenu();
      const data = res.data || res;
      const tree = handleTree(data, "menuId", "parentId", "children") as unknown as Menu[];
      setMenus(Array.isArray(tree) ? tree : []);
      showToast(toast.success("Menu data refreshed!"));
    } catch (err: any) {
      setError(err?.msg || err?.message || "Failed to refresh menu data");
      showToast(toast.error(err?.msg || err?.message || "Failed to refresh menu data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    listMenu()
      .then((res) => {
        const data = res.data || res;
        // Convert flat list to tree using menuId and parentId
        const tree = handleTree(data, "menuId", "parentId", "children") as unknown as Menu[];
        setMenus(Array.isArray(tree) ? tree : []);
        showToast(toast.success("Menu data loaded successfully!"));
      })
      .catch((err) => {
        setError(err.message || "Failed to load menu data");
        showToast(toast.error(err.message || "Failed to load menu data"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <h1 className="text-lg font-semibold">Menu Management</h1>
        <div className="flex flex-wrap gap-2">
          <ManagementButtons
            size="md"
            {...(canAdd ? { addLabel: "Add Menu", onAdd: () => openDialog() } : {})}
            onRefresh={() => refreshMenus()}
          />
        </div>
      </div>

      <div className="flex items-center bg-white  justify-between rounded-md mb-4 w-full">
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Loading menu data...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <table className="w-full border border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className=" p-3  border-b border-gray-300">Menu Name</th>
                  <th className=" p-3  border-b border-gray-300">Icon</th>
                  <th className=" p-3  border-b border-gray-300">Order</th>
                  <th className=" p-3  border-b border-gray-300">Type</th>
                  <th className=" p-3  border-b border-gray-300">Permission Key</th>
                  <th className=" p-3  border-b border-gray-300">Component Path</th>
                  <th className=" p-3  border-b border-gray-300">Status</th>
                  <th className=" p-3  border-b border-gray-300">Created At</th>
                  {showOperateColumn && (<th className=" p-3 border-b border-gray-300">Operate</th>)}
                </tr>
              </thead>
              <tbody>{renderMenus(menus)}</tbody>
            </table>
          )}
        </div>
      </div>
      <MenuDialog
        open={dialogOpen}
        title={editingMenu ? "Update Menu" : "Add Menu"}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        dict={mockDict}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Menu"
        message={`Are you sure you want to delete menu "${selectedMenuForDelete?.menuName}"? This action cannot be undone.`}
        isLoading={isDeleteLoading}
      />
    </div>
  );
};

export default MenuPage;