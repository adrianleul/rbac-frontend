import { useState, useEffect } from "react";
import Table from "../../../../components/Table";
import Pagination from "../../../../components/Pagination";
import { RefreshCw, Search, FilterIcon, Key } from "lucide-react";
import RoleModal from "./RoleModal";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import ConfirmStatusToggleModal from "../../../../components/modal/ConfirmStatusToggleModal";
import { listRole, changeRoleStatus, deleteRole } from "../../../../api/system/role";
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import Calendar from '../../../../components/ui/admin/Calandar';
import { download } from "../../../../utils/request";
import ManagementButtons from "../../../../components/ui/admin/ManagmentButtons";
import OperationButtons from "../../../../components/ui/admin/OperationButtons";
import { usePermission } from "../../../../utils/usePermisssion";
import ViewAssignedUsersModal from "./ViewAssignedUsersModal";
import { useToast, toast } from "../../../../components/alert/Toast";

type Role = {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: "0" | "1"; // "0" = Active, "1" = Inactive
  createTime: string;
};

const RolesPage = () => {
  const { showToast } = useToast();
  //Permission based rendering buttons
  const canAdd = usePermission('system:role:add');
  const canDelete = usePermission('system:role:remove');
  const canExport = usePermission('system:role:export');
  const canViewAssignedUsers = usePermission('system:role:list');
  const canEdit = usePermission('system:role:edit');
  const showOperateColumn = canEdit || canDelete || canViewAssignedUsers;

  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<RoleFilters>({});

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  // Status toggle modal state
  const [isStatusToggleOpen, setIsStatusToggleOpen] = useState(false);
  const [selectedRoleForStatus, setSelectedRoleForStatus] = useState<Role | null>(null);
  const [isStatusToggleLoading, setIsStatusToggleLoading] = useState(false);

  // Open modal and set selected role
  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  interface RoleFilters {
    roleName?: string;
    roleKey?: string;
    status?: string;
    beginTime?: string;
    endTime?: string;
  }

  const [filters, setFilters] = useState({
    roleName: "",
    roleKey: "",
    status: "",
    beginTime: "",
    endTime: "",
  });

  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null
  });

  const handleDateRangeChange = (dateRange: { startDate: Date | null; endDate: Date | null }) => {
    setDateRange(dateRange);

    // Helper function to format date as YYYY-MM-DD without timezone issues
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setFilters(prev => ({
      ...prev,
      beginTime: dateRange.startDate ? formatDate(dateRange.startDate) : "",
      endTime: dateRange.endDate ? formatDate(dateRange.endDate) : ""
    }));
  };

  const handleInputChange = (field: keyof RoleFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, itemsPerPage, activeFilters]);


  const columns = [
    { header: "Role ID", accessor: "roleId" },
    { header: "Role Name", accessor: "roleName" },
    { header: "Permission Key", accessor: "roleKey" },
    { header: "Sort Order", accessor: "roleSort" },
    { header: "Status", accessor: "status" },
    { header: "Creation Time", accessor: "createTime" },
    ...(showOperateColumn ? [{ header: "Operate", accessor: "operate" }] : []),
  ];

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await listRole({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        ...activeFilters
      });
      console.log('API Response:', response);

      let roleData: Role[] = [];
      let totalCount = 0;

      if (Array.isArray(response)) {
        // If response is an array, assume it's the data
        roleData = response.map(item => ({
          roleId: item.roleId || item.id || 0,
          roleName: item.rolename || item.roleName || item.name || '',
          roleKey: item.roleKey || '',
          roleSort: item.roleSort || '',
          status: item.status?.toString() || "0", // Default to "0" (Active)
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
        totalCount = roleData.length;
      } else if (response && typeof response === 'object') {
        const data = response as {
          rows?: any[],
          list?: any[],
          records?: any[],
          data?: any[],
          total?: number,
          totalCount?: number,
          count?: number
        };

        // Extract total count
        totalCount = data.total || data.totalCount || data.count || 0;

        let rawData: any[] = [];

        if (Array.isArray(data.rows)) {
          rawData = data.rows;
        } else if (Array.isArray(data.list)) {
          rawData = data.list;
        } else if (Array.isArray(data.records)) {
          rawData = data.records;
        } else if (Array.isArray(data.data)) {
          rawData = data.data;
        }

        // Map the raw data to match our Roles interface
        roleData = rawData.map(item => ({
          roleId: item.roleId || item.id || 0,
          roleName: item.rolename || item.roleName || item.name || '',
          roleKey: item.roleKey || '',
          roleSort: item.roleSort || '',
          status: item.status?.toString() || "0", // Default to "0" (Active)
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
      }

      console.log('Raw Roles Data:', roleData[0]); // Log the first roles to see its structure
      console.log('Processed Roles Data:', roleData); // Log all processed data
      console.log('Total Count:', totalCount); // Log total count

      if (roleData.length > 0 || totalCount > 0) {
        setRoles(roleData);
        setTotalItems(totalCount);
        showToast(toast.success(roleData.length > 0 ? `Successfully loaded ${roleData.length} roles (Total: ${totalCount})` : "No roles found"));
      } else {
        console.warn("No roles found in the response:", response);
        showToast(toast.error("No roles found"));
        setRoles([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to load roles"));
      setRoles([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (filters: RoleFilters) => {
    console.log("Applying filters:", filters);
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when applying filters
    setSelectedRows([]); // Reset selected rows
  };

  const handleResetFilters = () => {
    console.log("Resetting filters");
    setActiveFilters({});
    setCurrentPage(1); // Reset to first page when resetting filters
    setSelectedRows([]); // Reset selected rows
  };

  const handleSelectRow = (id: number | null, checked: boolean, bulkIds?: number[]) => {
    if (Array.isArray(bulkIds)) {
      setSelectedRows(checked ? bulkIds : []);
      return;
    }

    setSelectedRows((prev) =>
      checked ? [...prev, id!] : prev.filter((rowId) => rowId !== id)
    );
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset selected rows when changing pages
    setSelectedRows([]);
  };

  const getPaginatedRoles = () => {
    return roles;
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    setSelectedRows([]); // Reset selected rows
  };

  const handleToggleStatus = (role: Role) => {
    setSelectedRoleForStatus(role);
    setIsStatusToggleOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!selectedRoleForStatus) return;

    try {
      setIsStatusToggleLoading(true);

      // Fix the status toggle logic: "0" = Active, "1" = Inactive
      const newStatus = selectedRoleForStatus.status === "0" ? "1" : "0";
      const statusText = newStatus === "0" ? "activated" : "deactivated";

      await changeRoleStatus(selectedRoleForStatus.roleId.toString(), newStatus);

      // Update local state
      setRoles((prev) =>
        prev.map((role) =>
          role.roleId === selectedRoleForStatus.roleId
            ? { ...role, status: newStatus }
            : role
        )
      );

      showToast(toast.success(`Role "${selectedRoleForStatus.roleName}" has been ${statusText} successfully.`));

      setIsStatusToggleOpen(false);
      setSelectedRoleForStatus(null);
    } catch (error) {
      console.error("Status toggle failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to update role status"));
    } finally {
      setIsStatusToggleLoading(false);
    }
  };

  const handleCloseStatusToggle = () => {
    setIsStatusToggleOpen(false);
    setSelectedRoleForStatus(null);
    setIsStatusToggleLoading(false);
  };

  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDeleteSelected = async () => {
    let idsToDelete: number[] = [];

    if (selectedId !== null) {
      idsToDelete = [selectedId];
    } else {
      idsToDelete = [...selectedRows];
    }

    if (idsToDelete.length === 0) {
      showToast(toast.error("No roles selected for deletion."));
      return;
    }

    setIsDeleteLoading(true);
    try {
      await deleteRole(idsToDelete.map(String));
      setRoles((prev) => prev.filter((v) => !idsToDelete.includes(v.roleId)));
      setSelectedRows((prev) => prev.filter((id) => !idsToDelete.includes(id)));
      setSelectedId(null);
      showToast(toast.success("Role(s) deleted successfully."));
    } catch (error) {
      showToast(toast.error(error instanceof Error ? error.message : "Failed to delete role(s)"));
    } finally {
      setIsDeleteOpen(false);
      setIsDeleteLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRoles();
  };

  // Export roles - use backend export endpoint
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Prepare export parameters based on current filters
      const exportParams = {
        ...activeFilters,
        // Include pagination info if needed for export
        pageNum: 1,
        pageSize: 10000, // Large number to get all data
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `roles_export_${timestamp}.xlsx`;

      // Use the download function from request utility
      await download('/system/role/export', exportParams, filename);

      showToast(toast.success("Roles exported successfully!"));
    } catch (error) {
      console.error("Export failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to export roles"));
    } finally {
      setIsExporting(false);
    }
  };

  const renderRow = (role: Role) => (
    <tr
      key={role.roleId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      <td className="p-21 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(role.roleId)}
          onChange={(e) => handleSelectRow(role.roleId, e.target.checked)}
          className="mx-auto"
        />
      </td>
      <td className="p-3 border-b border-gray-300">{role.roleId}</td>
      <td className="p-3 border-b border-gray-300">{role.roleName}</td>
      <td className="p-3 border-b border-gray-300">{role.roleKey}</td>
      <td className="p-3 border-b border-gray-300">{role.roleSort}</td>
      <td className="p-3 border-b border-gray-300">
        <button
          onClick={() => handleToggleStatus(role)}
          className="inline-flex items-center cursor-pointer"
          title={role.status === "0" ? "Click to deactivate" : "Click to activate"}
        >
          <input
            type="checkbox"
            className="sr-only peer"
            checked={role.status === "0"} // "0" = Active (checked), "1" = Inactive (unchecked)
            readOnly
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </button>
      </td>
      <td className="p-3 border-b border-gray-300">{role.createTime}</td>
      {showOperateColumn && (
        <td className="p-3 border-b border-gray-300">
          <div className="flex justify-center gap-2">
            <OperationButtons
              size="sm"
              viewTitle="view Assigned Users"
              {...(canViewAssignedUsers ? { onView: () => { setSelectedRole(role); setViewModalOpen(true); } } : {})}
              editTitle="Edit Role"
              {...(canEdit ? { onEdit: () => openEditModal(role) } : {})}
              deleteTitle="Delete Role"
              {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(role.roleId) } } : {})}
            />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <h1 className="text-lg font-semibold">Role Management</h1>
        <div className="flex flex-wrap gap-2">
          <RoleModal
            open={modalOpen}
            onOpenChange={(open) => {
              setModalOpen(open);
            }}
            selectedRole={selectedRole}
            onSave={(success, message) => {
              showToast(success ? toast.success(message) : toast.error(message));
              if (success) fetchRoles();
            }}
          />
          <ManagementButtons
            size="md"
            {...(canAdd ? { addLabel: "Add Role", onAdd: () => { setSelectedRole(null); setModalOpen(true); } } : {})}
            {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(null) } } : {})}
            {...(canExport ? { onExport: () => { handleExport() }, isExporting } : {})}
            isExporting={isExporting}
            onRefresh={() => handleRefresh()}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-800">Active Filters:</span>
              {activeFilters.roleName && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Role Name: {activeFilters.roleName}</span>
              )}
              {activeFilters.roleKey && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Role Key: {activeFilters.roleKey}</span>
              )}
              {activeFilters.status && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Status: {activeFilters.status === '0' ? 'Active' : 'Inactive'}</span>
              )}
              {activeFilters.beginTime && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">From: {activeFilters.beginTime}</span>
              )}
              {activeFilters.endTime && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">To: {activeFilters.endTime}</span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-green-600 hover:text-green-800 underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 justify-between rounded-md mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={filters.roleName}
                placeholder="Filter by role name"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg"
                onChange={e => handleInputChange('roleName', e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              onClick={() => {
                // Only pass non-empty values
                const activeFilters = Object.fromEntries(
                  Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
                );
                handleFilter(activeFilters);
              }}
            >
              <FilterIcon className="w-4 h-4 mr-1" />
              Filter
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              <Key className="w-4 h-4 mr-1" />
              Advanced
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              onClick={() => {
                setFilters({
                  roleName: "",
                  roleKey: "",
                  status: "",
                  beginTime: "",
                  endTime: "",
                });
                setDateRange({ startDate: null, endDate: null });
                handleResetFilters();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>
        </div>

        {/* Filter Panels - More compact */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role Key</label>
              <Input
                type="text"
                value={filters.roleKey}
                placeholder="Search by Role Key"
                className="w-full pl-2 pr-3 py-1.5 text-sm rounded-lg"
                onChange={e => handleInputChange('roleKey', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Active</SelectItem>
                  <SelectItem value="1">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
              <Calendar
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Select date range"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center bg-white  justify-between rounded-md mb-4 w-full">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <Table
              columns={columns}
              renderRow={renderRow}
              data={getPaginatedRoles().map((u) => ({ ...u, id: u.roleId }))}
              selectable
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
            />
          )}
        </div>
      </div>
      <ConfirmStatusToggleModal
        isOpen={isStatusToggleOpen}
        onClose={handleCloseStatusToggle}
        onConfirm={handleConfirmStatusToggle}
        title="Toggle Role Status"
        message={`Are you sure you want to ${selectedRoleForStatus?.status === "0" ? "deactivate" : "activate"} the role "${selectedRoleForStatus?.roleName}"?`}
        currentStatus={selectedRoleForStatus?.status || "0"}
        itemName={selectedRoleForStatus?.roleName}
        isLoading={isStatusToggleLoading}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Role"
        message={`Are you sure you want to delete Role #${selectedId}${selectedRows}?`}
        isLoading={isDeleteLoading}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        showItemCount={true}
        showItemsPerPage={true}
        itemsPerPageOptions={[10, 20, 30, 50]}
        maxVisiblePages={5}
      />
      <ViewAssignedUsersModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        role={selectedRole ?? undefined}
      />
    </div>
  );
};

export default RolesPage;
