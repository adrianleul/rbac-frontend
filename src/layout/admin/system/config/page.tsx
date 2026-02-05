import { useState, useEffect } from "react";
import Table from "../../../../components/Table";
import Pagination from "../../../../components/Pagination";
import AddConfigurationModal from "./AddConfig";
import EditConfigurationModal from "./EditConfigModal";
import { listConfig, getConfig, delConfig } from "../../../../api/system/config";
import { useToast, toast } from "../../../../components/alert/Toast";
import { download } from "../../../../utils/request";
import ManagementButtons from "../../../../components/ui/admin/ManagmentButtons";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import OperationButtons from "../../../../components/ui/admin/OperationButtons";
import { usePermission } from "../../../../utils/usePermisssion";

type Parameter = {
  createBy?: string;
  createTime: string;
  updateBy?: string;
  updateTime?: string | null;
  remark: string;
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
};
const ConfigurationPage = () => {
  const { showToast } = useToast();
  //Permission based rendering buttons
  const canAdd = usePermission('system:dict:add');
  const canDelete = usePermission('system:dict:remove');
  const canExport = usePermission('system:dict:export');
  const canEdit = usePermission('system:dict:edit');
  const showOperateColumn = canEdit || canDelete;

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [params, setParams] = useState<Parameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  //const [activeFilters, setActiveFilters] = useState<ConfigFilters>({});

  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Parameter | null>(null);

  const handleEditParameter = (updatedParam: Parameter) => {
    setParams((prev) =>
      prev.map((p) => (p.configId === updatedParam.configId ? updatedParam : p))
    );
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const columns = [
    { header: "Parameter ID", accessor: "configId" },
    { header: "Name", accessor: "configName" },
    { header: "Key Name", accessor: "configKey" },
    { header: "Key Value", accessor: "configValue" },
    { header: "System Built-in?", accessor: "configType" },
    { header: "Remark", accessor: "remark" },
    { header: "Creation Time", accessor: "createTime" },
    ...(showOperateColumn ? [{ header: "Operate", accessor: "operate" }] : []),
  ];

  useEffect(() => {
    fetchConfigs();
  }, [currentPage, itemsPerPage,]);//activeFilters

  const fetchConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await listConfig({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        //...activeFilters
      });
      console.log('API Response:', response);

      let configData: Parameter[] = [];
      let totalCount = 0;

      if (Array.isArray(response)) {
        // If response is an array, assume it's the data
        configData = response.map(item => ({
          configId: item.configId || item.id || 0,
          configName: item.configName || item.name || '',
          configKey: item.configKey || '',
          configValue: item.configValue || '',
          configType: item.configType || '',
          remark: item.remark || '',
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
        totalCount = configData.length;
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

        // Map the raw data to match our Config interface
        configData = rawData.map(item => ({
          configId: item.configId || item.id || 0,
          configName: item.configName || item.name || '',
          configKey: item.configKey || '',
          configValue: item.configValue || '',
          configType: item.configType || '',
          remark: item.remark || '',
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
      }

      console.log('Raw Config Data:', configData[0]); // Log the first Configs to see its structure
      console.log('Processed Config Data:', configData); // Log all processed data
      console.log('Total Count:', totalCount); // Log total count

      if (configData.length > 0 || totalCount > 0) {
        setParams(configData);
        setTotalItems(totalCount);
        showToast(toast.success(`Successfully loaded ${configData.length} Config (Total: ${totalCount})`));
      } else {
        console.warn("No Config found in the response:", response);
        showToast(toast.error("No Config found"));
        setParams([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Failed to fetch Config:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to load Config"));
      setParams([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
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

  const getPaginatedConfigs = () => {
    return params;
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

  // Bulk/row delete handler
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
      for (const id of idsToDelete) {
        await delConfig(String(id));
      }
      showToast(
        idsToDelete.length === 1
          ? toast.success("Configuration deleted successfully.")
          : toast.success("Selected configurations deleted successfully.")
      );
      setSelectedRows([]);
      setSelectedId(null);
      fetchConfigs();
      setIsDeleteOpen(false);
    } catch (err: any) {
      showToast(toast.error(err?.message || "Failed to delete configuration(s)."));
    } finally {
      setIsDeleting(false);
    }
  };

  const renderRow = (item: Parameter) => (
    <tr
      key={item.configId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      {/* Checkbox Column */}
      <td className="p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(item.configId)}
          onChange={(e) => handleSelectRow(item.configId, e.target.checked)}
          className="mx-auto"
        />
      </td>

      {/* Data Columns */}
      <td className="p-3 border-b border-gray-300">{item.configId}</td>
      <td className="p-3 border-b border-gray-300">{item.configName}</td>
      <td className="p-3 border-b border-gray-300">{item.configKey}</td>
      <td className="p-3 border-b border-gray-300">{item.configValue}</td>
      <td className="p-3 border-b border-gray-300">{item.configType === "Y" ? "Yes" : "No"}</td>
      <td className="p-3 border-b border-gray-300">{item.remark}</td>
      <td className="p-3 border-b border-gray-300">{item.createTime}</td>

      {/* Operate Column */}
      {showOperateColumn && (
        <td className="p-3 border-b border-gray-300">
          <div className="flex justify-center gap-2">
            <OperationButtons
              size="sm"
              editTitle="Edit Configuration"
              {...(canEdit ? {
                onEdit: () => {
                  async () => {
                    try {
                      const res = await getConfig(String(item.configId));
                      if (res && typeof res === "object" && "data" in res && res.data) {
                        setEditData(res.data);
                        setEditModalOpen(true);
                      } else {
                        alert("Failed to fetch configuration data.");
                      }
                    } catch (err: any) {
                      alert(err?.message || "Failed to fetch configuration data.");
                    }
                  }
                }
              } : {})}
              deleteTitle="Delete Configuration"
              {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(item.configId) } } : {})}
            />
          </div>
        </td>
      )}
    </tr>
  );

  // Export handler
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
      const filename = `system_configs_export_${timestamp}.xlsx`;

      // Use the download function from request utility
      await download('/system/config/export', exportParams, filename);

      showToast(toast.success("System configurations exported successfully!"));
    } catch (error) {
      console.error("Export failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to export configurations"));
    } finally {
      setIsExporting(false);
    }
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      {/* Header Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <div>
          <h1 className="text-lg font-semibold">Configuration</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ManagementButtons
            size="md"
            {...(canAdd ? { addLabel: "Add Configuration", onAdd: () => setAddModalOpen(true) } : {})}
            {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(null) } } : {})}
            {...(canExport ? { onExport: () => { handleExport() }, isExporting } : {})}
            isExporting={isExporting}
            onRefresh={() => fetchConfigs()}
          />
        </div>
      </div>

      {/* Table */}
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
              data={getPaginatedConfigs().map((u) => ({ ...u, id: u.configId }))}
              selectable
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
            />
          )}
        </div>
      </div>


      <AddConfigurationModal
        open={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchConfigs}
      />

      <EditConfigurationModal
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdit={handleEditParameter}
        initialData={editData}
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
        title="Delete Configuration"
        message={
          selectedId !== null
            ? `Are you sure you want to delete Configuration #${selectedId}?`
            : `Are you sure you want to delete ${selectedRows.length} selected configuration(s)?`
        }
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ConfigurationPage;
