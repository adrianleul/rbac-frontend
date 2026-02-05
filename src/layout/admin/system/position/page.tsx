import { useState, useEffect } from "react";
import { listPost, addPost, delPost } from "../../../../api/system/post";
import Table from "../../../../components/Table";
import Pagination from "../../../../components/Pagination";
import PositionModal from "./PositionModal";
import { download } from "../../../../utils/request";
import { useToast, toast } from "../../../../components/alert/Toast";
import ManagementButtons from "../../../../components/ui/admin/ManagmentButtons";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import OperationButtons from "../../../../components/ui/admin/OperationButtons";
import { usePermission } from "../../../../utils/usePermisssion";

type Position = {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: string; // "0" or "1"
  createTime: string;
  remark?: string;
};

const PositionPage = () => {
  const { showToast } = useToast();
  //Permission based rendering buttons
  const canAdd = usePermission('system:post:add');
  const canDelete = usePermission('system:post:remove');
  const canExport = usePermission('system:post:export');
  const canEdit = usePermission('system:post:edit');
  const showOperateColumn = canEdit || canDelete;

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [posts, setPosts] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditPosition, setSelectedEditPosition] = useState<Position | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchPositions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPost();
      const data = res.data || res;
      const fetchedPosts = data.rows || data.data || [];
      setPosts(fetchedPosts);
      setTotalItems(fetchedPosts.length);
    } catch (err: any) {
      setError(err.message || "Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleEditClick = (position: Position) => {
    setSelectedEditPosition(position);
    setEditModalOpen(true);
  };

  const columns = [
    { header: "Position ID", accessor: "postId" },
    { header: "Position Code", accessor: "postCode" },
    { header: "Job Title", accessor: "postName" },
    { header: "Sorting", accessor: "postSort" },
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
        await delPost(String(id));
      }
      showToast(
        idsToDelete.length === 1
          ? toast.success("Position deleted successfully.")
          : toast.success("Selected positions deleted successfully.")
      );
      setSelectedRows([]);
      setSelectedId(null);
      fetchPositions();
      setIsDeleteOpen(false);
    } catch (err: any) {
      showToast(toast.error(err?.message || "Failed to delete position(s)."));
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
      const filename = `positions_export_${timestamp}.xlsx`;

      // Use the download function from request utility
      await download('/system/post/export', exportParams, filename);

      showToast(toast.success("Positions exported successfully!"));
    } catch (error) {
      console.error("Export failed:", error);
      showToast(toast.error(error instanceof Error ? error.message : "Failed to export positions"));
    } finally {
      setIsExporting(false);
    }
  };

  const paginatedPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderRow = (item: Position) => (
    <tr
      key={item.postId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      {/* Checkbox Column */}
      <td className="p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(item.postId)}
          onChange={(e) => handleSelectRow(item.postId, e.target.checked)}
          className="mx-auto"
        />
      </td>

      {/* Data Columns */}
      <td className="p-3 border-b border-gray-300">{item.postId}</td>
      <td className="p-3 border-b border-gray-300">{item.postCode}</td>
      <td className="p-3 border-b border-gray-300">{item.postName}</td>
      <td className="p-3 border-b border-gray-300">{item.postSort}</td>
      <td className="p-3 border-b border-gray-300">
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${item.status === "0"
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}>
          {item.status === "0" ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-3 border-b border-gray-300">{item.createTime}</td>

      {/* Operate Column */}
      {showOperateColumn && (
        <td className="p-3 border-b border-gray-300">
          <div className="flex justify-center gap-2">
            <OperationButtons
              size="sm"
              editTitle="Edit Position"
              {...(canEdit ? { onEdit: () => handleEditClick(item) } : {})}
              deleteTitle="Delete Position"
              {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(item.postId) } } : {})}
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
        <h1 className="text-lg font-semibold">Position Management</h1>
        <div className="flex flex-wrap gap-2">
          <ManagementButtons
            size="md"
            {...(canAdd ? { addLabel: "Add Position", onAdd: () => setAddModalOpen(true) } : {})}
            {...(canDelete ? { onDelete: () => { setIsDeleteOpen(true), setSelectedId(null) } } : {})}
            {...(canExport ? { onExport: () => { handleExport() }, isExporting } : {})}
            isExporting={isExporting}
            onRefresh={() => fetchPositions()}
          />
        </div>
      </div>

      <div className="flex items-center bg-white  justify-between rounded-md mb-4 w-full">
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <Table
              columns={columns}
              renderRow={renderRow}
              data={paginatedPosts.map((u) => ({ ...u, id: u.postId }))}
              selectable
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
            />
          )}
        </div>
      </div>

      <PositionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={async (updated) => {
          // Call updatePost API here
          try {
            const res = await import('../../../../api/system/post').then(m => m.updatePost(updated));
            if (res.code === 200) {
              showToast(toast.success('Position updated successfully!'));
              fetchPositions();
              setEditModalOpen(false);
              setSelectedEditPosition(null);
            } else {
              showToast(toast.error(res.data.msg || 'Failed to update position'));
            }
          } catch (err: any) {
            showToast(toast.error(err?.message || 'Failed to update position'));
          }
        }}
        position={selectedEditPosition}
      />

      <PositionModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={async (formData) => {
          const res = await addPost(formData);
          if (res.code === 200) {
            showToast(toast.success('Position added successfully!'));
            fetchPositions();
            setAddModalOpen(false);
          } else {
            showToast(toast.error(res.msg || 'Failed to add position'));
          }
        }}
        position={null}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedId(null); }}
        onConfirm={handleDeleteSelected}
        title="Delete Position"
        message={
          selectedId !== null
            ? `Are you sure you want to delete Position #${selectedId}?`
            : `Are you sure you want to delete ${selectedRows.length} selected position(s)?`
        }
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PositionPage;
