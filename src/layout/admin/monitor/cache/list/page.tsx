import { useState, useEffect } from "react";
import Table from "../../../../../components/Table";
import { listCacheName } from "../../../../../api/monitor/cache";
import { useToast, toast } from "../../../../../components/alert/Toast";
import OperationButtons from "../../../../../components/ui/admin/OperationButtons";
import ViewKeyListModal from "./ViewKeyListModal";
import ConfirmDeleteModal from '../../../../../components/modal/ConfirmDeleteModal';
import { clearCacheName } from '../../../../../api/monitor/cache';
import ManagementButtons from "../../../../../components/ui/admin/ManagmentButtons";

const CacheListPage = () => {
  interface CacheItem {
    cacheName: string;
    cacheKey: string;
    cacheValue: string;
    remark: string;
  }
  const [caches, setCaches] = useState<CacheItem[]>([]);
  const [selectedKeylist, setSelectedKeyList] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCacheName, setSelectedCacheName] = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchCacheList = async () => {
    setIsLoading(true);
    try {
      const res = await listCacheName();
      // If using axios, data is in res.data
      const data = res.data ? res.data : res;
      // Try to support both array and object with .data
      const cacheList = Array.isArray(data) ? data : data.data;
      setCaches(cacheList || []);
      showToast(toast.success("Cache list refreshed successfully!"));
    } catch (err) {
      showToast(toast.error("Failed to refresh cache list."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCacheList();
  };

  const handleOpenDeleteModal = (cacheName: string) => {
    setSelectedCacheName(cacheName);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedCacheName(null);
    setIsDeleting(false);
  };

  const handleDeleteCache = async () => {
    if (!selectedCacheName) return;
    setIsDeleting(true);
    try {
      await clearCacheName(selectedCacheName);
      showToast(toast.success('Cache deleted successfully.'));
      fetchCacheList();
      handleCloseDeleteModal();
    } catch (err) {
      showToast(toast.error('Failed to delete cache.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Cache Name", accessor: "cacheName" },
    { header: "Remark", accessor: "remark" },
    { header: "Operate", accessor: "operate" },
  ];

  // Prepare data with dynamic id
  const cachesWithId = caches.map((item, idx) => ({ ...item, _rowId: idx + 1 }));

  const renderRow = (item: CacheItem & { _rowId: number }) => (
    <tr
      key={item.cacheName + item._rowId}
      className="text-sm hover:bg-slate-50 text-center"
    >
      <td className="p-3 border-b border-gray-300">{item._rowId}</td>
      <td className="p-3 border-b border-gray-300">{item.cacheName}</td>
      <td className="p-3 border-b border-gray-300">{item.remark}</td>
      <td className="p-3 border-b border-gray-300">
        <div className="flex justify-center gap-2">
          <OperationButtons
            viewTitle="View"
            onView={() => {
              setSelectedKeyList(item.cacheName);
              setViewModalOpen(true);
            }}
            deleteTitle="Delete"
            onDelete={() => handleOpenDeleteModal(item.cacheName)}
          />
        </div>
      </td>
    </tr>
  );

  useEffect(() => {
    fetchCacheList();
  }, []);

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <div>
          <h1 className="text-lg font-semibold">Cache List Monitoring</h1>
        </div>
        <ManagementButtons
          onRefresh={() => handleRefresh()}
        />
      </div>

      <div className="flex items-center bg-white  justify-between rounded-md mb-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={cachesWithId}
            renderRow={renderRow}
          />
        )}
      </div>

      <ViewKeyListModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        keyList={selectedKeylist ? { cacheName: selectedKeylist } : undefined}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteCache}
        title="Delete Cache"
        message={`Are you sure you want to delete cache "${selectedCacheName}"? This action cannot be undone.`}
        isLoading={isDeleting}
        confirmLabel="Delete Cache"
      />
    </div>
  );
};

export default CacheListPage;
