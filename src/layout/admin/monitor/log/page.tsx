import { useState, useEffect } from "react";
import Table from "../../../../components/Table";
import Pagination from "../../../../components/Pagination";
import { FilterIcon, Key, RefreshCw, Search } from "lucide-react";
import ViewOperationModal from "./ViewOperationModal";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import { list as fetchOperationLogs, delOperlog } from "../../../../api/monitor/operLog";
import Calendar from '../../../../components/ui/admin/Calandar';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { download } from "../../../../utils/request";
import { useToast, toast } from "../../../../components/alert/Toast";
import ManagementButtons from "../../../../components/ui/admin/ManagmentButtons";
import OperationButtons from "../../../../components/ui/admin/OperationButtons";
import { cn } from '../../../../utils/cn';
import { usePermission } from "../../../../utils/usePermisssion";

type OperationLog = {
  operId: number;
  title: string;
  businessType: number;
  businessTypes: number[] | null;
  method: string;
  requestMethod: string;
  operatorType: number;
  operName: string;
  deptName: string;
  operUrl: string;
  operIp: string;
  operLocation: string;
  operParam: string; // JSON stringified object
  jsonResult: string; // JSON stringified object
  status: number; // 0 = success, 1 = failure
  errorMsg: string | null;
  operTime: string; // ISO or formatted date string
  costTime: number; // milliseconds
};

const OperationLogPage = () => {
  const { showToast } = useToast();
  //Permission based rendering buttons
  const canDelete = usePermission('monitor:operlog:remove');
  const canExport = usePermission('monitor:operlog:export');

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single');

  // Filter state
  interface OperLogFilters {
    operIp?: string;
    title?: string;
    operName?: string;
    businessType?: string;
    status?: string;
    beginTime?: string;
    endTime?: string;
  }
  const [activeFilters, setActiveFilters] = useState<OperLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    operIp: "",
    title: "",
    operName: "",
    businessType: "",
    status: "",
    beginTime: "",
    endTime: "",
  });
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null
  });

  const handleInputChange = (field: keyof OperLogFilters, value: string) => {
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

  const handleFilter = (filters: OperLogFilters) => {
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

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, activeFilters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOperationLogs({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        ...activeFilters
      });
      const data = res.data || res;
      let logs: OperationLog[] = [];
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
      setError(err.message || "Failed to load operation logs");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "ID", accessor: "operId" },
    { header: "Title", accessor: "title" },
    { header: "Business Type", accessor: "businessType" },
    { header: "Request Method", accessor: "requestMethod" },
    { header: "Operator", accessor: "operName" },
    { header: "IP", accessor: "operIp" },
    { header: "Dept", accessor: "deptName" },
    { header: "Status", accessor: "status" },
    { header: "Time", accessor: "operTime" },
    { header: "Operate", accessor: "operate" },
  ];

  const handleSelectRow = (id: number | null, checked: boolean, bulkIds?: number[]) => {
    if (Array.isArray(bulkIds)) {
      setSelectedRows(checked ? bulkIds : []);
      return;
    }
    setSelectedRows((prev) => (checked ? [...prev, id!] : prev.filter((rowId) => rowId !== id)));
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

      console.log("Deleting Operation Log:", idsToDelete);

      // Use delOperlog API for single or bulk delete
      await delOperlog(idsToDelete);
      showToast(toast.success("Operation logs deleted successfully."));
      // Refresh data after deletion
      fetchData();
      setSelectedRows([]);
      setSelectedId(null);
    } catch (error) {
      console.error("Delete failed:", error);
      showToast(toast.error("Failed to delete operation logs"));
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

      // Prepare export parameters based on current filters
      const exportParams = {
        ...activeFilters,
        // Include pagination info if needed for export
        pageNum: 1,
        pageSize: 10000, // Large number to get all data
      };

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `operation_logs_export_${timestamp}.xlsx`;

      // Use the download function from request utility
      await download('/monitor/operlog/export', exportParams, filename);

      showToast(toast.success("Operation logs exported successfully!"));
    } catch (error) {
      console.error("Export failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to export operation logs"));
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to map businessType number to string
  const getBusinessTypeLabel = (type: string | number) => {
    switch (type) {
      case "0":
      case 1:
        return "Add";
      case "1":
      case 2:
        return "Update";
      case "2":
      case 3:
        return "Delete";
      case "3":
      case 4:
        return "Authorize";
      case "4":
      case 5:
        return "Export";
      case "5":
      case 6:
        return "Import";
      case "6":
      case 7:
        return "Force Logout";
      case "7":
      case 8:
        return "Other";
      default:
        return type;
    }
  };

  const renderRow = (item: OperationLog) => (
    <tr key={item.operId} className="text-sm hover:bg-slate-50 text-center">
      <td className="p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(item.operId)}
          onChange={(e) => handleSelectRow(item.operId, e.target.checked)}
          className="mx-auto"
        />
      </td>
      <td className="p-3 border-b border-gray-300">{item.operId}</td>
      <td className="p-3 border-b border-gray-300">{item.title}</td>
      <td className="p-3 border-b border-gray-300">
        {(() => {
          const label = getBusinessTypeLabel(item.businessType);
          let colorClass = '';
          switch (label) {
            case 'Add':
              colorClass = 'bg-green-100 text-green-800 hover:bg-green-200';
              break;
            case 'Update':
              colorClass = 'bg-blue-100 text-blue-800 hover:bg-blue-200';
              break;
            case 'Delete':
              colorClass = 'bg-red-100 text-red-800 hover:bg-red-200';
              break;
            case 'Authorize':
              colorClass = 'bg-purple-100 text-purple-800 hover:bg-purple-200';
              break;
            case 'Export':
              colorClass = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
              break;
            case 'Import':
              colorClass = 'bg-pink-100 text-pink-800 hover:bg-pink-200';
              break;
            case 'Force Logout':
              colorClass = 'bg-orange-100 text-orange-800 hover:bg-orange-200';
              break;
            case 'Other':
              colorClass = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
              break;
            default:
              colorClass = 'bg-slate-100 text-slate-800';
          }
          return (
            <span className={cn('text-xs px-2 py-1 rounded-full transition-colors duration-150', colorClass)}>
              {label}
            </span>
          );
        })()}
      </td>
      <td className="p-3 border-b border-gray-300">{item.requestMethod}</td>
      <td className="p-3 border-b border-gray-300">{item.operName}</td>
      <td className="p-3 border-b border-gray-300">{item.operIp}</td>
      <td className="p-3 border-b border-gray-300">{item.deptName}</td>
      <td className="p-3 border-b border-gray-300">
        <span className={`text-xs px-2 py-1 rounded-full ${item.status === 0 ? "bg-green-100 text-green-700 hover:bg-green-400" : "bg-red-100 text-red-700 hover:bg-red-400"}`}>
          {item.status === 0 ? "Success" : "Failure"}
        </span>
      </td>
      <td className="p-3 border-b border-gray-300">{item.operTime}</td>
      <td className="p-3 border-b border-gray-300">
        <div className="flex justify-center gap-2">
          <OperationButtons
            size="sm"
            viewTitle="view"
            onView={() => {
              setSelectedLog(item);
              setViewModalOpen(true);
            }}
            deleteTitle="Delete User"
            {...(canDelete ? { onDelete: () => handleOpenDeleteModal('single', item.operId) } : {})}
          />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <h1 className="text-lg font-semibold">Operation Log</h1>
        <div className="flex flex-wrap gap-2">
          <ManagementButtons
            size="md"
            {...(canDelete ? {
              onDelete: () => {
                {
                  if (selectedRows.length > 0) {
                    handleOpenDeleteModal('bulk');
                  } else {
                    showToast(toast.warning("Please select items to delete"));
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
              {activeFilters.title && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Title: {activeFilters.title}</span>
              )}
              {activeFilters.operIp && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Operation IP: {activeFilters.operIp}</span>
              )}
              {activeFilters.operName && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Operator's Username: {activeFilters.operName}</span>
              )}
              {activeFilters.status && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Status: {activeFilters.status === '0' ? 'Active' : 'Inactive'}</span>
              )}
              {activeFilters.businessType && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Business Type: {activeFilters.businessType}</span>
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
                value={filters.title}
                placeholder="Filter by title"
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg"
                onChange={e => handleInputChange('title', e.target.value)}
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
                  operIp: "",
                  title: "",
                  operName: "",
                  businessType: "",
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Operation IP</label>
              <Input
                type="text"
                value={filters.operIp}
                placeholder="Search by Operation IP"
                className="w-full pl-2 pr-3 py-1.5 text-sm rounded-lg"
                onChange={e => handleInputChange('operIp', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Operator's Username</label>
              <Input
                type="text"
                value={filters.operName}
                placeholder="Search by Operator's Username"
                className="w-full pl-2 pr-3 py-1.5 text-sm rounded-lg"
                onChange={e => handleInputChange('operName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Select Business Type</label>
              <Select
                value={filters.businessType || ''}
                onValueChange={(value) => handleInputChange('businessType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Business Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Add</SelectItem>
                  <SelectItem value="2">Update</SelectItem>
                  <SelectItem value="3">Delete</SelectItem>
                  <SelectItem value="4">Authorize</SelectItem>
                  <SelectItem value="5">Export</SelectItem>
                  <SelectItem value="6">Iport</SelectItem>
                  <SelectItem value="7">Force Logout</SelectItem>
                  <SelectItem value="8">other</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="0">Success</SelectItem>
                  <SelectItem value="1">Failed</SelectItem>
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
            <div className="p-4 text-center">Loading logs...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <Table
              columns={columns}
              renderRow={renderRow}
              data={logs.map((u) => ({ ...u, id: u.operId }))}
              selectable
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
            />
          )}
        </div>
      </div>

      <ViewOperationModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        data={selectedLog}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteSelected}
        title={deleteType === 'bulk' ? 'Delete Selected Logs' : 'Delete Log'}
        message={
          deleteType === 'bulk'
            ? `Are you sure you want to delete ${selectedRows.length} selected operation log(s)? This action cannot be undone.`
            : 'Are you sure you want to delete this operation log? This action cannot be undone.'
        }
        isLoading={isDeleting}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
};

export default OperationLogPage;
