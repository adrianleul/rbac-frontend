import { useState, useEffect } from "react";
import Table from "../../../../components/Table";
import Pagination from "../../../../components/Pagination";
import { RefreshCw, Search, Key, FilterIcon } from "lucide-react";
import { UserModal } from "./UserModal";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import ConfirmStatusToggleModal from "../../../../components/modal/ConfirmStatusToggleModal";
import { ResetUserPasswordModal } from "./ResetUserPassword";
import { listUser, changeUserStatus, deleteUser } from "../../../../api/system/user";
import { download } from "../../../../utils/request";
import { ImportModal } from "../../../../components/modal/ImportModal";
import DepartmentTreeSelect from "../../../../components/ui/admin/Department";
import Calendar from '../../../../components/ui/admin/Calandar';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { ManagementButtons } from '../../../../components/ui/admin/ManagmentButtons'
import OperationButtons from "../../../../components/ui/admin/OperationButtons";
import { usePermission } from "../../../../utils/usePermisssion";
import { useToast, toast } from "../../../../components/alert/Toast";

type User = {
  userId: number;
  username: string;
  phone: string;
  department: string;
  status: "0" | "1"; // "0" = Active, "1" = Inactive
  createTime: string;
};

const UserPage = () => {
  const { showToast } = useToast();

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  interface UserFilters {
    userName?: string;
    phonenumber?: string;
    status?: string;
    deptId?: number;
    beginTime?: string;
    endTime?: string;
  }

  // Filter state
  const [activeFilters, setActiveFilters] = useState<UserFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>();
  const [filters, setFilters] = useState({
    deptId: "",
    userName: "",
    phonenumber: "",
    status: "",
    beginTime: "",
    endTime: "",
  });
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null
  });

  const handleInputChange = (field: keyof UserFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const handleDepartmentChange = (deptId: number | null) => {
    setSelectedDepartment(deptId || undefined);
    setFilters(prev => ({
      ...prev,
      deptId: deptId ? String(deptId) : ""
    }));
  };

  // Status toggle modal state
  const [isStatusToggleOpen, setIsStatusToggleOpen] = useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState<User | null>(null);
  const [isStatusToggleLoading, setIsStatusToggleLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editUserId, setEditUserId] = useState<string | number | null>(null);
  const [editUserLoadingId, setEditUserLoadingId] = useState<string | number | null>(null);

  const [open, setOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const canAddUser = usePermission('system:user:add');
  const canDeleteUser = usePermission('system:user:remove');
  const canImportUser = usePermission('system:user:import');
  const canExportUser = usePermission('system:user:export');
  const canResetPwd = usePermission('system:user:resetPwd');
  const canEditUser = usePermission('system:user:edit');
  const showOperateColumn = canEditUser || canDeleteUser || canResetPwd;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, activeFilters]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await listUser({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        ...activeFilters
      });
      console.log('API Response:', response); // Debug log

      // The response is already processed by the interceptor
      let userData: User[] = [];
      let totalCount = 0;

      if (Array.isArray(response)) {
        // If response is an array, assume it's the data
        userData = response.map(item => ({
          userId: item.userId || item.id || 0,
          username: item.username || item.userName || item.name || '',
          phone: item.phone || item.phonenumber || item.contact || '',
          department: item.dept?.deptName || item.department || '',
          status: item.status?.toString() || "0", // Default to "0" (Active)
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
        totalCount = userData.length; // Fallback to array length
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

        // Map the raw data to match our User interface
        userData = rawData.map(item => ({
          userId: item.userId || item.id || 0,
          username: item.username || item.userName || item.name || '',
          phone: item.phone || item.phonenumber || item.contact || '',
          department: item.dept?.deptName || item.department || '',
          status: item.status?.toString() || "0", // Default to "0" (Active)
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
      }

      console.log('Raw User Data:', userData[0]); // Log the first user to see its structure
      console.log('Processed User Data:', userData); // Log all processed data
      console.log('Total Count:', totalCount); // Log total count

      if (userData.length > 0 || totalCount > 0) {
        setUsers(userData);
        setTotalItems(totalCount);
        showToast(toast.success(`Successfully loaded ${userData.length} users (Total: ${totalCount})`));
      } else {
        console.warn("No users found in the response:", response);
        setUsers([]);
        setTotalItems(0);
        showToast(toast.error("No users found"));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotalItems(0);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to load users"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleFilter = (filters: UserFilters) => {
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

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset selected rows when changing pages
    setSelectedRows([]);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    setSelectedRows([]); // Reset selected rows
  };

  // Get paginated data (now using backend pagination, so this is just for display)
  const getPaginatedUsers = () => {
    // Since we're using backend pagination, the users array already contains the current page data
    return users;
  };

  const columns = [
    { header: "User ID", accessor: "userId" },
    { header: "Username", accessor: "username" },
    { header: "Phone Number", accessor: "phone" },
    { header: "Department", accessor: "department" },
    { header: "Status", accessor: "status" },
    { header: "Creation Time", accessor: "createTime" },
    ...(showOperateColumn ? [{ header: "Operate", accessor: "operate" }] : []),
  ];

  const handleSelectRow = (id: number | null, checked: boolean, bulkIds?: number[]) => {
    if (Array.isArray(bulkIds)) {
      setSelectedRows(checked ? bulkIds : []);
      return;
    }

    setSelectedRows((prev) =>
      checked ? [...prev, id!] : prev.filter((rowId) => rowId !== id)
    );
  };

  const handleStatusToggle = (user: User) => {
    setSelectedUserForStatus(user);
    setIsStatusToggleOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!selectedUserForStatus) return;

    try {
      setIsStatusToggleLoading(true);

      // Fix the status toggle logic: "0" = Active, "1" = Inactive
      const newStatus = selectedUserForStatus.status === "0" ? "1" : "0";
      const statusText = newStatus === "0" ? "activated" : "deactivated";

      await changeUserStatus(selectedUserForStatus.userId.toString(), newStatus);

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.userId === selectedUserForStatus.userId
            ? { ...user, status: newStatus }
            : user
        )
      );

      showToast(toast.success(`User "${selectedUserForStatus.username}" has been ${statusText} successfully.`));

      setIsStatusToggleOpen(false);
      setSelectedUserForStatus(null);
    } catch (error) {
      console.error("Status toggle failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to update user status"));
    } finally {
      setIsStatusToggleLoading(false);
    }
  };

  const handleCloseStatusToggle = () => {
    setIsStatusToggleOpen(false);
    setSelectedUserForStatus(null);
    setIsStatusToggleLoading(false);
  };

  const handleDeleteSelected = async () => {
    try {
      setIsDeleting(true);

      let userIdsToDelete: string[] = [];

      if (selectedId !== null) {
        // Single user deletion
        userIdsToDelete = [selectedId.toString()];
      } else {
        // Bulk deletion
        userIdsToDelete = selectedRows.map(id => id.toString());
      }

      if (userIdsToDelete.length === 0) {
        showToast(toast.error("No users selected for deletion"));
        return;
      }

      console.log("Deleting User(s):", userIdsToDelete);

      // Call API for deletion
      await deleteUser(userIdsToDelete);

      // Update local state
      setUsers((prev) => prev.filter((v) => !userIdsToDelete.includes(v.userId.toString())));
      setSelectedRows((prev) => prev.filter((id) => !userIdsToDelete.includes(id.toString())));
      setSelectedId(null);

      showToast(toast.success(
        userIdsToDelete.length === 1
          ? "User deleted successfully."
          : `${userIdsToDelete.length} users deleted successfully.`)
      );
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to delete user(s)"));
    } finally {
      setIsDeleting(false);
    }
  };

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
      const filename = `users_export_${timestamp}.xlsx`;

      // Use the download function from request utility
      await download('/system/user/export', exportParams, filename);

      showToast(toast.success("User data exported successfully!"));
    } catch (error) {
      console.error("Export failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to export user data"));
    } finally {
      setIsExporting(false);
    }
  };

  const renderRow = (item: User) => (
    <tr
      key={item.userId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      <td className="p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(item.userId)}
          onChange={(e) => handleSelectRow(item.userId, e.target.checked)}
          className="mx-auto"
        />
      </td>
      <td className="p-3 border-b border-gray-300">{item.userId}</td>
      <td className="p-3 border-b border-gray-300">{item.username}</td>
      <td className="p-3 border-b border-gray-300">{item.phone}</td>
      <td className="p-3 border-b border-gray-300">{item.department}</td>
      <td className="p-3 border-b border-gray-300">
        <button
          onClick={() => handleStatusToggle(item)}
          className="inline-flex items-center cursor-pointer"
          title={item.status === "0" ? "Click to deactivate" : "Click to activate"}
        >
          <input
            type="checkbox"
            className="sr-only peer"
            checked={item.status === "0"} // "0" = Active (checked), "1" = Inactive (unchecked)
            readOnly
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </button>
      </td>
      <td className="p-3 border-b border-gray-300">{item.createTime}</td>
      {showOperateColumn && (
        <td className="p-3 border-b border-gray-300">
          <div className="flex justify-center gap-2">
            {canResetPwd && (
              <ResetUserPasswordModal
                userId={item.userId}
                username={item.username}
                onSuccess={() => {
                  showToast(toast.success(`Password reset successfully for user \"${item.username}\"`));
                }}
                onError={(errorMessage) => {
                  showToast(toast.error(errorMessage));
                }}
              />
            )}
            <OperationButtons
              size="sm"
              editTitle="Edit User"
              {...(canEditUser ? { onEdit: () => { setEditUserId(item.userId); setIsUserModalOpen(true); setEditUserLoadingId(item.userId); } } : {})}
              deleteTitle="Delete User"
              {...(canDeleteUser ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(item.userId) } } : {})}
            />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <div>
          <h1 className="text-lg font-semibold">User Management</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ManagementButtons
            size="md"
            {...(canAddUser ? { addLabel: "Add User", onAdd: () => setIsUserModalOpen(true) } : {})}
            {...(canDeleteUser ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(null) } } : {})}
            {...(canImportUser ? { onImport: () => setOpen(true) } : {})}
            {...(canExportUser ? { onExport: () => { handleExport() }, isExporting } : {})}
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
              {activeFilters.userName && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Username: {activeFilters.userName}</span>
              )}
              {activeFilters.phonenumber && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Phone: {activeFilters.phonenumber}</span>
              )}
              {activeFilters.status && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Status: {activeFilters.status === '0' ? 'Active' : 'Inactive'}</span>
              )}
              {activeFilters.deptId && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Dept ID: {activeFilters.deptId}</span>
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
                value={filters.userName}
                placeholder="Filter by username"
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg"
                onChange={e => handleInputChange('userName', e.target.value)}
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
                  deptId: "",
                  userName: "",
                  phonenumber: "",
                  status: "",
                  beginTime: "",
                  endTime: "",
                });
                setDateRange({ startDate: null, endDate: null });
                setSelectedDepartment(undefined);
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
              <DepartmentTreeSelect
                value={selectedDepartment || null}
                onChange={handleDepartmentChange}
                placeholder="Select Department"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
              <Calendar
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Select date range"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <Input
                type="text"
                value={filters.phonenumber}
                placeholder="Search by Phone Number"
                className="w-full pl-2 pr-3 py-1.5 text-sm rounded-lg"
                onChange={e => handleInputChange('phonenumber', e.target.value)}
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
          </div>
        )}
      </div>

      <div className="flex items-center bg-white justify-between rounded-md mb-4 w-full">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <Table
              columns={columns}
              renderRow={renderRow}
              data={getPaginatedUsers().map((u) => ({ ...u, id: u.userId }))}
              selectable
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
            />
          )}
        </div>
      </div>

      {/* Pagination Component */}
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

      <UserModal
        open={isUserModalOpen}
        onOpenChange={(open) => {
          setIsUserModalOpen(open);
          if (!open) setEditUserId(null);
        }}
        onUserAdded={fetchUsers}
        onUserUpdated={() => {
          fetchUsers();
          setIsUserModalOpen(false);
          setEditUserId(null);
        }}
        userId={editUserId}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Delete User"
        message={
          selectedId !== null
            ? `Are you sure you want to delete User #${selectedId}?`
            : `Are you sure you want to delete ${selectedRows.length} selected user(s)?`
        }
        isLoading={isDeleting}
      />

      <ConfirmStatusToggleModal
        isOpen={isStatusToggleOpen}
        onClose={handleCloseStatusToggle}
        onConfirm={handleConfirmStatusToggle}
        title="Toggle User Status"
        message={`Are you sure you want to ${selectedUserForStatus?.status === "0" ? "deactivate" : "activate"} the user "${selectedUserForStatus?.username}"?`}
        currentStatus={selectedUserForStatus?.status || "0"}
        itemName={selectedUserForStatus?.username}
        isLoading={isStatusToggleLoading}
      />

      <ImportModal
        open={open}
        title="User Import"
        updateLabel="Whether to update existing User data"
        downloadTemplateUrl="/system/user/importTemplate"
        uploadUrl="/system/user/importData"
        onClose={() => setOpen(false)}
        onSuccess={() => {
          showToast(toast.success("Import successful!"));
        }}
      />
    </div>
  );
};

export default UserPage;
