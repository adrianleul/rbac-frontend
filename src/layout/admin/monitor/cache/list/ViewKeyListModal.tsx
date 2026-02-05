import Table from "../../../../../components/Table";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../../../components/ui/dialog";
import { listCacheKey } from '../../../../../api/monitor/cache';
import OperationButtons from "../../../../../components/ui/admin/OperationButtons";
import ViewCacheContentModal from './ViewCacheContentModal';
import ConfirmDeleteModal from '../../../../../components/modal/ConfirmDeleteModal';
import { clearCacheKey } from '../../../../../api/monitor/cache';
import { useToast, toast } from "../../../../../components/alert/Toast";

interface ViewKeyListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyList?: {cacheName: string };
}

const ViewKeyListModal = ({ open, onOpenChange, keyList }: ViewKeyListModalProps) => {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [caches, setCaches] = useState<string[]>([]);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedCacheKey, setSelectedCacheKey] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedKeyToDelete, setSelectedKeyToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeys = async () => {
      if (open && keyList?.cacheName) {
        setIsLoading(true);
        try {
          const res = await listCacheKey(keyList.cacheName);
          // Assume the API returns an array of keys in res.data or res
          const keys = res.data ? res.data : res;
          setCaches(Array.isArray(keys) ? keys : []);
        } catch (err) {
          setCaches([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCaches([]);
      }
    };
    fetchKeys();
  }, [open, keyList]);

  // Prepare data with dynamic id
  const cacheKeysWithId = caches.map((key, idx) => ({ key, _rowId: idx + 1 }));

  const columns = [
    { header: "ID", accessor: "_rowId" },
    { header: "Cache Key name", accessor: "key" },
    { header: "Operate", accessor: "operate" }
  ];

  const renderRow = (cache: { key: string; _rowId: number }) => (
    <tr
      key={cache.key}
      className="text-sm hover:bg-slate-50 text-center"
    >
      <td className="p-3 border-b border-gray-300">{cache._rowId}</td>
      <td className="p-3 border-b border-gray-300">{cache.key}</td>
      <td className="p-3 border-b border-gray-300">
      <div className="flex justify-center gap-2">
          <OperationButtons
          viewTitle="View"
          onView={() => {
            setSelectedCacheKey(cache.key);
            setContentModalOpen(true);
          }}
          deleteTitle="Delete"
          onDelete={() => handleOpenDeleteModal(cache.key)}
          />
        </div>
      </td>
    </tr>
  );
    const handleOpenDeleteModal = (key: string) => {
  setSelectedKeyToDelete(key);
  setDeleteModalOpen(true);
};

const handleCloseDeleteModal = () => {
  setDeleteModalOpen(false);
  setSelectedKeyToDelete(null);
  setIsDeleting(false);
};

const handleDeleteKey = async () => {
  if (!selectedKeyToDelete) return;
  setIsDeleting(true);
  try {
    await clearCacheKey(selectedKeyToDelete);
    showToast(toast.success('Cache key deleted successfully.'));
    // Refresh key list
    if (keyList?.cacheName) {
      const res = await listCacheKey(keyList.cacheName);
      const keys = res.data ? res.data : res;
      setCaches(Array.isArray(keys) ? keys : []);
    }
    handleCloseDeleteModal();
  } catch (err) {
    showToast(toast.error('Failed to delete cache key.'));
  } finally {
    setIsDeleting(false);
  }
};
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-full" footer={null} width={1000}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between w-full">
              <span>Key List</span>
            </DialogTitle>
          </DialogHeader>
        
          <div className="flex items-center bg-white  justify-between rounded-md mb-4 w-full">
            <div className="w-full overflow-x-auto">
            {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
            ) : (
            <Table
            columns={columns}
            data={cacheKeysWithId}
            renderRow={renderRow}
            />
          )}
            </div>
          </div>
        </DialogContent>
        <ViewCacheContentModal
          open={contentModalOpen}
          onOpenChange={setContentModalOpen}
          cacheName={keyList?.cacheName || ''}
          cacheKey={selectedCacheKey || ''}
        />
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteKey}
          title="Delete Cache Key"
          message={`Are you sure you want to delete cache key "${selectedKeyToDelete}"? This action cannot be undone.`}
          isLoading={isDeleting}
          confirmLabel="Delete Key"
        />
      </Dialog>
    );
}

export default ViewKeyListModal;