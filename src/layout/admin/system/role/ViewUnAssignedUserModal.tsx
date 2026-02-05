import Table from "../../../../components/Table";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { unallocatedUserList } from "../../../../api/system/role";
import Pagination from "../../../../components/Pagination";
import { useToast, toast } from "../../../../components/alert/Toast";
import { FilterIcon, RefreshCw, Search } from "lucide-react";
import { authUserSelectAll } from "../../../../api/system/role";

interface ViewUnAssignedUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: { roleId: number; roleName: string };
}

const ViewUnAssignedUsersModal = ({ open, onOpenChange, role }: ViewUnAssignedUsersModalProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  // Filter state
  const [activeFilters, setActiveFilters] = useState<UserFilters>({});
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [roles, setRoles] = useState<RoleAssignedUser[]>([]);

  interface UserFilters {
    userName?: string;
    phonenumber?: string;
  }

  const [filters, setFilters] = useState({
    userName: "",
    phonenumber: "",
  });

  type RoleAssignedUser = {
    userId: number;
    userName: string;
    nickName: string;
    email: string;
    phonenumber: string;
    status: "0" | "1"; // "0" = Active, "1" = Inactive
    createTime: string;
  };

  const columns = [
    { header: "User ID", accessor: "userId" },
    { header: "Username", accessor: "userName" },
    { header: "User Nickname", accessor: "nickName" },
    { header: "Email", accessor: "email" },
    { header: "Phonenumber", accessor: "phonenumber" },
    { header: "Status", accessor: "status" },
    { header: "Creation Time", accessor: "createTime" },
  ];

  useEffect(() => {
    if (open && role?.roleId) {
      fetchAssignedUsers();
    }
    if (!open) {
      setSelectedRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentPage, itemsPerPage, activeFilters, role?.roleId]);

  const fetchAssignedUsers = async () => {
    if (!role?.roleId) return;
    try {
      setIsLoading(true);
      const response = await unallocatedUserList(
        String(role.roleId),
        {
          pageNum: currentPage,
          pageSize: itemsPerPage,
          ...activeFilters
        }
      );
      let roleAssignedUserData: RoleAssignedUser[] = [];
      let totalCount = 0;

      if (Array.isArray(response)) {
        roleAssignedUserData = response.map(item => ({
          userId: item.userId || item.id || 0,
          userName: item.userName || '',
          nickName: item.nickName || '',
          email: item.email || '',
          phonenumber: item.phonenumber || '',
          status: item.status?.toString() || "0",
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
        totalCount = roleAssignedUserData.length;
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
        roleAssignedUserData = rawData.map(item => ({
          userId: item.userId || item.id || 0,
          userName: item.userName || '',
          nickName: item.nickName || '',
          email: item.email || '',
          phonenumber: item.phonenumber || '',
          status: item.status?.toString() || "0",
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
      }
      setRoles(roleAssignedUserData);
      setTotalItems(totalCount);
    } catch (error) {
      showToast(toast.error(error instanceof Error ? error.message : "Failed to load roles"));
      setRoles([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRows([]);
  };
  const getPaginatedRoles = () => roles;
  const handleInputChange = (field: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };
  const handleFilter = (filters: UserFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    setSelectedRows([]);
  };
  const handleResetFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
    setSelectedRows([]);
  };
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedRows([]);
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
  const renderRow = (role: RoleAssignedUser) => (
    <tr
      key={role.userId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      <td className="p-21 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(role.userId)}
          onChange={(e) => handleSelectRow(role.userId, e.target.checked)}
          className="mx-auto"
        />
      </td>
      <td className="p-3 border-b border-gray-300">{role.userId}</td>
      <td className="p-3 border-b border-gray-300">{role.userName}</td>
      <td className="p-3 border-b border-gray-300">{role.nickName}</td>
      <td className="p-3 border-b border-gray-300">{role.email}</td>
      <td className="p-3 border-b border-gray-300">{role.phonenumber}</td>
      <td className=" p-3 border-b border-gray-300">
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${role.status === "0"
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}>
          {role.status === "0" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-3 border-b border-gray-300">{role.createTime}</td>
    </tr>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full" footer={null} width={1000}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full">
            <span>Assign users for Role{role?.roleName ? `: ${role.roleName}` : ''}</span>
          </DialogTitle>
        </DialogHeader>
        {/* Active Filters Display */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                {activeFilters.userName && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">User Name: {activeFilters.userName}</span>
                )}
                {activeFilters.phonenumber && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Phone number: {activeFilters.phonenumber}</span>
                )}
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
        <div className="bg-white p-4 justify-between rounded-md mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.userName}
                    placeholder="Filter by User name"
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={e => handleInputChange('userName', e.target.value)}
                  />
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.phonenumber}
                    placeholder="Filter by Phone number"
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={e => handleInputChange('phonenumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <button
                className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                onClick={() => {
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
                className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                onClick={() => {
                  setFilters({
                    userName: "",
                    phonenumber: "",
                  });
                  handleResetFilters();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset
              </button>
            </div>
          </div>
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
                data={getPaginatedRoles().map((u) => ({ ...u, id: u.userId }))}
                selectable
                selectedRows={selectedRows}
                onSelectRow={handleSelectRow}
              />
            )}
          </div>
        </div>
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
        <div className="flex justify-end mt-4 gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={selectedRows.length === 0 || !role?.roleId}
            onClick={async () => {
              if (!role?.roleId || selectedRows.length === 0) return;
              try {
                await authUserSelectAll(String(role.roleId), selectedRows.map(String));
                showToast(toast.success("Users assigned successfully!"));
                setSelectedRows([]);
                onOpenChange(false);
              } catch (error) {
                showToast(toast.error(error instanceof Error ? error.message : "Failed to assign users"));
              }
            }}
          >
            OK
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewUnAssignedUsersModal;