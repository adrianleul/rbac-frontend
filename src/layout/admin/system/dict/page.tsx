import { useState, useEffect } from "react";
import Table from "../../../../components/Table";
import Pagination from "../../../../components/Pagination";
import DictionaryModal from "./DictModal";
import { listType, addType, updateType, delType } from "../../../../api/dict/type";
import { useToast, toast } from "../../../../components/alert/Toast";
import { download } from "../../../../utils/request";
import ManagementButtons from "../../../../components/ui/admin/ManagmentButtons";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import OperationButtons from "../../../../components/ui/admin/OperationButtons";
import { usePermission } from "../../../../utils/usePermisssion";

type Dictionary = {
  createBy?: string;
  createTime: string;
  updateBy?: string | null;
  updateTime?: string | null;
  remark: string;
  dictId: number;
  dictName: string;
  dictType: string;
  status: string;
};

const DictionaryPage = () => {
  const { showToast } = useToast();
  //Permission based rendering buttons
  const canAdd = usePermission('system:dict:add');
  const canDelete = usePermission('system:dict:remove');
  const canExport = usePermission('system:dict:export');
  const canEdit = usePermission('system:dict:edit');
  const showOperateColumn = canEdit || canDelete;

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [dicts, setDicts] = useState<Dictionary[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDict, setEditingDict] = useState<Dictionary | null>(null);

  // Filter state
  //const [activeFilters, setActiveFilters] = useState<DictTypeFilters>({});

  const handleAddDictionary = async (newDict: {
    dictName: string;
    dictType: string;
    status: "0" | "1";
    remark: string;
  }) => {
    try {
      setIsLoading(true);

      // Prepare the data for the API
      const apiData = {
        dictName: newDict.dictName,
        dictType: newDict.dictType,
        status: newDict.status,
        remark: newDict.remark
      };

      const response = await addType(apiData);

      if (response.code === 200) {
        // Show success notification
        showToast(toast.success("Dictionary added successfully!"));

        // Close the modal
        setIsAddOpen(false);

        // Refresh the data by calling fetchDictTypes
        await fetchDictTypes();
      } else {
        // Show error notification
        showToast(toast.error(response.msg || "Failed to add dictionary"));
      }
    } catch (error) {
      console.error("Error adding dictionary:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to add dictionary"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDictionary = async (updatedDict: {
    dictId: number;
    dictName: string;
    dictType: string;
    status: "0" | "1";
    remark: string;
  }) => {
    try {
      setIsLoading(true);

      // Prepare the data for the API
      const apiData = {
        dictId: updatedDict.dictId,
        dictName: updatedDict.dictName,
        dictType: updatedDict.dictType,
        status: updatedDict.status,
        remark: updatedDict.remark
      };

      const response = await updateType(apiData);

      if ((response as any).code === 200) {
        // Show success notification
        showToast(toast.success("Dictionary updated successfully!"));


        // Refresh the data by calling fetchDictTypes
        await fetchDictTypes();
      } else {
        // Show error notification
        showToast(toast.error((response as any).msg || "Failed to update dictionary"));
      }
    } catch (error) {
      console.error("Error updating dictionary:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to update dictionary"));
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: "Dictionary ID", accessor: "dictId" },
    { header: "Name", accessor: "dictName" },
    { header: "Type", accessor: "dictType" },
    { header: "Status", accessor: "status" },
    { header: "Remark", accessor: "remark" },
    { header: "Creation Time", accessor: "createTime" },
    ...(showOperateColumn ? [{ header: "Operate", accessor: "operate" }] : []),
  ];

  useEffect(() => {
    fetchDictTypes();
  }, [currentPage, itemsPerPage,]); //activeFilters  <- include this for filtering

  const fetchDictTypes = async () => {
    try {
      setIsLoading(true);
      const response = await listType({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        //...activeFilters
      });
      console.log('API Response:', response);

      let dictTypeData: Dictionary[] = [];
      let totalCount = 0;

      if (Array.isArray(response)) {
        // If response is an array, assume it's the data
        dictTypeData = response.map(item => ({
          dictId: item.dictId || item.id || 0,
          dictName: item.dictName || item.name || '',
          dictType: item.dictType || '',
          status: item.status?.toString() || "0", // Default to "0" (Active)
          remark: item.remark || '',
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
        totalCount = dictTypeData.length;
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

        // Map the raw data to match our Dict Type interface
        dictTypeData = rawData.map(item => ({
          dictId: item.dictId || item.id || 0,
          dictName: item.dictName || item.name || '',
          dictType: item.dictType || '',
          status: item.status?.toString() || "0", // Default to "0" (Active)
          remark: item.remark || '',
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
      }

      console.log('Raw User Data:', dictTypeData[0]); // Log the first user to see its structure
      console.log('Processed User Data:', dictTypeData); // Log all processed data
      console.log('Total Count:', totalCount); // Log total count

      if (dictTypeData.length > 0 || totalCount > 0) {
        setDicts(dictTypeData);
        setTotalItems(totalCount);
        showToast(toast.success(`Successfully loaded ${dictTypeData.length} dict types (Total: ${totalCount})`));
      } else {
        console.warn("No dict types found in the response:", response);
        showToast(toast.error("No dict types found"));
        setDicts([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Failed to fetch dict types:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to load dict types"));
      setDicts([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Reset selected rows when changing pages
    setSelectedRows([]);
  };

  const getPaginatedDictTypes = () => {
    return dicts;
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
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

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      let idsToDelete: number[] = [];
      if (selectedId !== null) {
        idsToDelete = [selectedId];
      } else {
        idsToDelete = selectedRows;
      }
      if (idsToDelete.length === 0) {
        showToast(toast.error("No rows selected for deletion."));
        setIsDeleting(false);
        return;
      }
      await Promise.all(idsToDelete.map(id => delType(String(id))));
      showToast(
        idsToDelete.length === 1
          ? toast.success("Dictionary type deleted successfully.")
          : toast.success("Selected dictionary types deleted successfully.")
      );
      setSelectedRows([]);
      setSelectedId(null);
      fetchDictTypes();
      setIsDeleteOpen(false);
    } catch (err: any) {
      showToast(toast.error(err?.message || "Failed to delete dictionary type(s)."));
    } finally {
      setIsDeleting(false);
    }
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
      const filename = `dictionary_types_export_${timestamp}.xlsx`;

      // Use the download function from request utility
      await download('/system/dict/type/export', exportParams, filename);

      showToast(toast.success("Dictionary types exported successfully!"));
    } catch (error) {
      console.error("Export failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to export dictionary types"));
    } finally {
      setIsExporting(false);
    }
  };

  const renderRow = (item: Dictionary) => (
    <tr
      key={item.dictId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      <td className=" p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(item.dictId)}
          onChange={(e) => handleSelectRow(item.dictId, e.target.checked)}
          className="mx-auto"
        />
      </td>

      {/* Data Columns */}
      <td className=" p-3 border-b border-gray-300">{item.dictId}</td>
      <td className=" p-3 border-b border-gray-300">{item.dictName}</td>
      <td className=" p-3   border-b border-gray-300">{item.dictType}</td>
      <td className=" p-3 border-b border-gray-300">
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${item.status === "0"
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}>
          {item.status === "0" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className=" p-3   border-b border-gray-300">{item.remark}</td>
      <td className=" p-3   border-b border-gray-300">{item.createTime}</td>

      {/* Operate Column */}
      {showOperateColumn && (
        <td className=" p-3 border-b border-gray-300">
          <div className="flex justify-center gap-2">
            <OperationButtons
              size="sm"
              editTitle="Edit Dictionary"
              {...(canEdit ? { onEdit: () => { setEditingDict(item); setIsEditOpen(true); } } : {})}
              deleteTitle="Delete Dictionary"
              {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(item.dictId) } } : {})}
            />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      {/* Header Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <div>
          <h1 className="text-lg font-semibold">Dictionary Management</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ManagementButtons
            size="md"
            {...(canAdd ? { addLabel: "Add Dictionary", onAdd: () => setIsAddOpen(true) } : {})}
            {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(null) } } : {})}
            {...(canExport ? { onExport: () => { handleExport() }, isExporting } : {})}
            isExporting={isExporting}
            onRefresh={() => fetchDictTypes()}
          />
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
              data={getPaginatedDictTypes().map((u) => ({ ...u, id: u.dictId }))}
              selectable
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
            />
          )}
        </div>
      </div>

      <DictionaryModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddDictionary}
        isLoading={isLoading}
      />

      {/* Edit Dictionary Modal */}
      <DictionaryModal
        open={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingDict(null); }}
        onUpdate={handleUpdateDictionary}
        isLoading={isLoading}
        dictionary={editingDict
          ? { ...editingDict, status: editingDict.status === "1" ? "1" : "0" }
          : null}
        mode="edit"
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

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedId(null); }}
        onConfirm={handleDeleteSelected}
        title="Delete Dictionary Type"
        message={
          selectedId !== null
            ? `Are you sure you want to delete Dictionary Type #${selectedId}?`
            : `Are you sure you want to delete ${selectedRows.length} selected dictionary type(s)?`
        }
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DictionaryPage;
