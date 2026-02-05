import { useState, useEffect } from "react";
import Table from "../../../../components/Table";
import Pagination from "../../../../components/Pagination";
import NoticeModal from "./NotficationModal";
import { listNotice, deleteNotice, updateNotice, getNotice } from "../../../../api/system/notice";
import { useToast, toast } from "../../../../components/alert/Toast";
import ManagementButtons from "../../../../components/ui/admin/ManagmentButtons";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import OperationButtons from "../../../../components/ui/admin/OperationButtons";
import { usePermission } from "../../../../utils/usePermisssion";

type Notice = {
  noticeId: number;
  noticeTitle: string;
  noticeType: "0" | "1" | "2" | "3"; // "0" = Announcement, "1" = Notice, "2" = Warning, "3" = Danger
  status: "0" | "1"; // "0" = Active, "1" = Inactive
  noticeContent?: string;
  createBy: string;
  createTime: string;
  remark?: string;
};

const NoticeManagementPage = () => {
  const { showToast } = useToast();
  //Permission based rendering buttons
  const canAdd = usePermission('system:notice:add');
  const canDelete = usePermission('system:notice:remove');
  const canEdit = usePermission('system:notice:edit');
  const showOperateColumn = canEdit || canDelete;

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editingTargets, setEditingTargets] = useState<any[]>([]);

  // Add handler:
  const handleAddNotice = (newNotice: Notice) => {
    setNotices((prev) => [newNotice, ...prev]);
  };

  const columns = [
    { header: "Notice ID", accessor: "noticeId" },
    { header: "Title", accessor: "noticeTitle" },
    { header: "Type", accessor: "noticeType" },
    { header: "Status", accessor: "status" },
    { header: "Created By", accessor: "createBy" },
    { header: "Create Time", accessor: "createTime" },
    ...(showOperateColumn ? [{ header: "Operate", accessor: "operate" }] : []),
  ];

  const handleSelectRow = (id: number | null, checked: boolean, bulkIds?: number[]) => {
    if (id === null && bulkIds) {
      // Handle select/deselect all
      setSelectedRows(checked ? bulkIds : []);
    } else if (id !== null) {
      setSelectedRows((prev) =>
        checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)
      );
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [currentPage, itemsPerPage,]); //activeFilters  <- include this for filtering

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await listNotice({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        //...activeFilters
      });
      console.log('API Response:', response);

      let noticeData: Notice[] = [];
      let totalCount = 0;

      if (Array.isArray(response)) {
        // If response is an array, assume it's the data
        noticeData = response.map(item => ({
          noticeId: item.noticeId || item.id || 0,
          noticeTitle: item.noticeTitle || item.name || '',
          noticeType: item.noticeType || '',
          status: item.status?.toString() || "0", // Default to "0" (Active)
          createBy: item.createBy || '',
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
        totalCount = noticeData.length;
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

        // Map the raw data to match our Notice Type interface
        noticeData = rawData.map(item => ({
          noticeId: item.noticeId || item.id || 0,
          noticeTitle: item.noticeTitle || item.name || '',
          noticeType: item.noticeType || '',
          status: item.status?.toString() || "0", // Default to "0" (Active)
          createBy: item.createBy || '',
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
      }

      console.log('Raw User Data:', noticeData[0]); // Log the first user to see its structure
      console.log('Processed User Data:', noticeData); // Log all processed data
      console.log('Total Count:', totalCount); // Log total count

      if (noticeData.length > 0 || totalCount > 0) {
        setNotices(noticeData);
        setTotalItems(totalCount);
        showToast(toast.success(noticeData.length + " Notice (Total: " + totalCount + ")"));
      } else {
        console.warn("No Notice found in the response:", response);
        showToast(toast.error("No Notice found"));
        setNotices([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Failed to fetch Notice:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to Notice"));
      setNotices([]);
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
    return notices;
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    setSelectedRows([]); // Reset selected rows
  };

  // Bulk delete handler
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
        await deleteNotice(String(id));
      }
      showToast(
        toast.success(
          idsToDelete.length === 1
            ? "Notice deleted successfully."
            : "Selected notices deleted successfully."
        )
      );
      setSelectedRows([]);
      setSelectedId(null);
      fetchNotices();
      setIsDeleteOpen(false);
    } catch (err: any) {
      showToast(toast.error(err?.message || "Failed to delete notice(s)."));
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit handler
  const handleEditClick = async (noticeId: number) => {
    setIsEditLoading(true);
    try {
      const res = await getNotice(String(noticeId));
      let notice: Notice | null = null;
      let targets: any[] = [];
      if (res && typeof res === 'object') {
        const data = res.data || res;
        notice = {
          noticeId: data.noticeId || data.id || 0,
          noticeTitle: data.noticeTitle || data.name || '',
          noticeType: data.noticeType || '0',
          status: data.status?.toString() || '0',
          noticeContent: data.noticeContent || '',
          createBy: data.createBy || '',
          createTime: data.createTime || data.createdAt || data.createDate || new Date().toISOString(),
          remark: data.remark || '',
        };
        targets = data.targets || [];
      }
      setEditingNotice(notice);
      setEditingTargets(targets);
      setIsEditModalOpen(true);
    } catch (err) {
      showToast(toast.error('Failed to fetch notice for editing'));
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingNotice(null);
    setEditingTargets([]);
  };

  const handleEditModalSubmit = async (updatedNotice: Notice) => {
    try {
      await updateNotice(updatedNotice);
      showToast(toast.success('Notice updated successfully.'));
      fetchNotices();
      setIsEditModalOpen(false);
      setEditingNotice(null);
      setEditingTargets([]);
    } catch (err: any) {
      showToast(toast.error(err?.message || 'Failed to update notice.'));
    }
  };

  const renderRow = (item: Notice) => (
    <tr
      key={item.noticeId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      <td className="p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(item.noticeId)}
          onChange={(e) => handleSelectRow(item.noticeId, e.target.checked)}
          className="mx-auto"
        />
      </td>
      <td className="p-3 border-b border-gray-300">{item.noticeId}</td>
      <td className="p-3 border-b border-gray-300">{item.noticeTitle}</td>
      <td className="p-3 border-b border-gray-300">
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${item.noticeType === "0"
            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
            : item.noticeType === "1"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : item.noticeType === "2"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}>
          {item.noticeType === "0"
            ? "Announcement"
            : item.noticeType === "1"
              ? "Notice"
              : item.noticeType === "2"
                ? "Warning"
                : item.noticeType === "3"
                  ? "Danger"
                  : "Unknown"}
        </span>
      </td>
      <td className="p-3 border-b border-gray-300">
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${item.status === "0"
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}>
          {item.status === "0" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-3 border-b border-gray-300">{item.createBy}</td>
      <td className="p-3 border-b border-gray-300">{item.createTime}</td>
      {showOperateColumn && (
        <td className="p-3 border-b border-gray-300">
          <div className="flex justify-center gap-2">
            <OperationButtons
              size="sm"
              editTitle="Edit Notification"
              {...(canEdit ? { onEdit: () => handleEditClick(item.noticeId) } : {})}
              deleteTitle="Delete Notification"
              {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(item.noticeId) } } : {})}
            />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <h1 className="text-lg font-semibold">Notice Management</h1>
        <div className="flex flex-wrap gap-2">
          <ManagementButtons
            size="md"
            {...(canAdd ? { addLabel: "Add Notification", onAdd: () => setIsAddModalOpen(true) } : {})}
            {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(null) } } : {})}
            onRefresh={() => fetchNotices()}
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
              data={getPaginatedDictTypes().map((u) => ({ ...u, id: u.noticeId }))}
              selectable
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
            />
          )}
        </div>
      </div>

      <NoticeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNotice}
      />

      {editingNotice && (
        <NoticeModal
          open={isEditModalOpen}
          onClose={handleEditModalClose}
          onAdd={() => { }}
          editNotice={editingNotice}
          editTargets={editingTargets}
          onEdit={handleEditModalSubmit}
          isEdit
        />
      )}

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
        title="Delete Notice"
        message={
          selectedId !== null
            ? `Are you sure you want to delete Notice #${selectedId}?`
            : `Are you sure you want to delete ${selectedRows.length} selected notice(s)?`
        }
        isLoading={isDeleting}
      />
    </div>
  );
};

export default NoticeManagementPage;
