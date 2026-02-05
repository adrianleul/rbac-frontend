import { useState, useEffect } from "react";
import Table from "../../../../../components/Table";
import Pagination from "../../../../../components/Pagination";
import { FilterIcon, Key, RefreshCw, Search } from "lucide-react";
import { list as fetchLoginLogs, delLogininfor } from "../../../../../api/monitor/loginInfo";
import { download } from "../../../../../utils/request";
import { useToast, toast } from "../../../../../components/alert/Toast";
import ManagementButtons from "../../../../../components/ui/admin/ManagmentButtons";
import { Input } from '../../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import Calendar from '../../../../../components/ui/admin/Calandar';
import OperationButtons from "../../../../../components/ui/admin/OperationButtons";
import ConfirmDeleteModal from '../../../../../components/modal/ConfirmDeleteModal';
import { usePermission } from "../../../../../utils/usePermisssion";

type LoginLog = {
  infoId: number;
  userName: string;
  status: '0' | '1'; // '0' = success, '1' = failure
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  msg: string;
  loginTime: string; // ISO or formatted date string
};

const LoginLogPage = () => {
  const { showToast } = useToast();
  const canDelete = usePermission('monitor:loginfor:remove');
  const canExport = usePermission('monitor:loginfor:export');
  const showOperateColumn = canDelete;

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  interface LoginLogFilters {
    ipaddr?: string;
    userName?: string;
    status?: string;
    beginTime?: string;
    endTime?: string;
  }
  const [activeFilters, setActiveFilters] = useState<LoginLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ipaddr: "",
    userName: "",
    status: "",
    beginTime: "",
    endTime: "",
  });
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleInputChange = (field: keyof LoginLogFilters, value: string) => {
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

  const handleFilter = (filters: LoginLogFilters) => {
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

  // Check if any filter is set
  const isAnyFilterSet = Object.values(filters).some(v => v !== undefined && v !== "");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLoginLogs({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        ...activeFilters
      });
      const data = res.data || res;
      let logs: LoginLog[] = [];
      let total = 0;
      if (Array.isArray(data.rows)) {
        logs = data.rows;
        total = data.total || data.rows.length;
      } else if (Array.isArray(data.data)) {
        logs = data.data;
        total = data.total || data.data.length;
      }
      setLogs(logs);
      setTotalItems(total);
    } catch (err: any) {
      setError(err.message || "Failed to load login logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, activeFilters]);

  const columns = [
    { header: "Log ID", accessor: "infoId" },
    { header: "Username", accessor: "userName" },
    { header: "Status", accessor: "status" },
    { header: "IP Address", accessor: "ipaddr" },
    { header: "Location", accessor: "loginLocation" },
    { header: "Browser", accessor: "browser" },
    { header: "OS", accessor: "os" },
    { header: "Message", accessor: "msg" },
    { header: "Login Time", accessor: "loginTime" },
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

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      let idsToDelete: number[] = [];
      if (deleteType === 'single' && selectedId !== null) {
        idsToDelete = [selectedId];
      } else {
        idsToDelete = [...selectedRows];
      }
      await delLogininfor(idsToDelete.map(String));
      showToast(toast.success('Login logs deleted successfully.'));
      fetchData();
      setSelectedRows([]);
      setSelectedId(null);
    } catch (error) {
      console.error('Delete failed:', error);
      showToast(toast.error('Failed to delete login logs'));
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleOpenDeleteModal = (type: 'single' | 'bulk', id?: number) => {
    setDeleteType(type);
    if (type === 'single' && id) {
      setSelectedId(id);
    }
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedId(null);
    setIsDeleting(false);
  };

  // Export handler - use backend export endpoint
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Prepare export parameters
      const exportParams = {
        // Include pagination info if needed for export
        pageNum: 1,
        pageSize: 10000, // Large number to get all data
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `login_logs_export_${timestamp}.xlsx`;

      // Use the download function from request utility
      await download('/monitor/logininfor/export', exportParams, filename);

      showToast(toast.success("Login logs exported successfully!"));
    } catch (error) {
      console.error("Export failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to export login logs"));
    } finally {
      setIsExporting(false);
    }
  };

  const renderRow = (item: LoginLog) => (
    <tr
      key={item.infoId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      <td className="p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(item.infoId)}
          onChange={(e) => handleSelectRow(item.infoId, e.target.checked)}
          className="mx-auto"
        />
      </td>
      <td className="p-3 border-b border-gray-300">{item.infoId}</td>
      <td className="p-3 border-b border-gray-300">{item.userName}</td>
      <td className="p-3 border-b border-gray-300">
        <span
          className={`px-2 py-1 rounded text-white text-xs ${item.status === "0" ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {item.status === "0" ? "Success" : "Failure"}
        </span>
      </td>
      <td className="p-3 border-b border-gray-300">{item.ipaddr}</td>
      <td className="p-3 border-b border-gray-300">{item.loginLocation}</td>
      <td className="p-3 border-b border-gray-300">{item.browser}</td>
      <td className="p-3 border-b border-gray-300">{item.os}</td>
      <td className="p-3 border-b border-gray-300">{item.msg}</td>
      <td className="p-3 border-b border-gray-300">{item.loginTime}</td>
      {showOperateColumn && (
        <td className="p-3 border-b border-gray-300">
          <div className="flex justify-center gap-2">
            <OperationButtons
              size="sm"
              deleteTitle="Delete Log"
              onDelete={() => handleOpenDeleteModal('single', item.infoId)}
            />
          </div>
        </td>
      )}

    </tr>
  );

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <h1 className="text-lg font-semibold">Login Logs</h1>
        <div className="flex flex-wrap gap-2">
          <ManagementButtons
            size="md"
            {...(canDelete ? {
              onDelete: () => {
                {
                  if (selectedRows.length > 0) {
                    handleOpenDeleteModal('bulk');
                  } else {
                    showToast(toast.warning('Please select items to delete'));
                  }
                }
              }
            } : {})}
            {...(canExport ? { onExport: () => { handleExport() }, isExporting } : {})}
            onRefresh={() => fetchData()}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-green-800">Active Filters:</span>
              {activeFilters.ipaddr && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">IP Address: {activeFilters.ipaddr}</span>
              )}
              {activeFilters.userName && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Username: {activeFilters.userName}</span>
              )}
              {activeFilters.status && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Login Status: {activeFilters.status === '0' ? 'Success' : 'Failure'}</span>
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
                placeholder="Filter by Username"
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg"
                onChange={e => handleInputChange('userName', e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm ${isAnyFilterSet ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              onClick={() => {
                // Only pass non-empty values
                const activeFilters = Object.fromEntries(
                  Object.entries(filters).filter(([_, v]) => v !== undefined && v !== "")
                );
                handleFilter(activeFilters);
              }}
              disabled={!isAnyFilterSet}
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
                  ipaddr: "",
                  userName: "",
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
              <label className="block text-xs font-medium text-gray-700 mb-1">IP Address</label>
              <Input
                type="text"
                value={filters.ipaddr}
                placeholder="Search by IP Address"
                className="w-full pl-2 pr-3 py-1.5 text-sm rounded-lg"
                onChange={e => handleInputChange('ipaddr', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Login Status</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Success</SelectItem>
                  <SelectItem value="1">Failure</SelectItem>
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
          {loading ? (
            <div className="p-4 text-center">Loading login logs...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <Table
              columns={columns}
              renderRow={renderRow}
              data={logs.map((u) => ({ ...u, id: u.infoId }))}
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
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteSelected}
        title={deleteType === 'bulk' ? 'Delete Selected Logs' : 'Delete Log'}
        message={
          deleteType === 'bulk'
            ? `Are you sure you want to delete ${selectedRows.length} selected login log(s)? This action cannot be undone.`
            : 'Are you sure you want to delete this login log? This action cannot be undone.'
        }
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LoginLogPage;
