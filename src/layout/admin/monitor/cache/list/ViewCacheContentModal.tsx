import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import { getCacheValue } from '../../../../../api/monitor/cache';

interface ViewCacheContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cacheName: string;
  cacheKey: string;
}

const ViewCacheContentModal = ({ open, onOpenChange, cacheName, cacheKey }: ViewCacheContentModalProps) => {
  const [cacheContent, setCacheContent] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (open && cacheName && cacheKey) {
        setLoading(true);
        setError(null);
        try {
          const res = await getCacheValue(cacheName, cacheKey);
          const data = res.data ? res.data : res;
          if (typeof data === 'object' && data !== null) {
            setCacheContent(data.cacheValue || "");
            setRemark(data.remark || "");
          } else {
            setCacheContent(typeof data === 'string' ? data : JSON.stringify(data));
            setRemark("");
          }
        } catch (err: any) {
          setError(err.message || "Failed to load cache content");
        } finally {
          setLoading(false);
        }
      } else {
        setCacheContent("");
        setRemark("");
      }
    };
    fetchContent();
  }, [open, cacheName, cacheKey]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent footer={null} className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Cache Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div><strong>Cache Name:</strong> {cacheName}</div>
          <div><strong>Cache Key:</strong> {cacheKey}</div>
          {remark && <div><strong>Remark:</strong> {remark}</div>}
          <div>
            <strong>Cache Content:</strong>
            <div className="mt-2 p-2 bg-gray-100 rounded text-sm break-all">
              {loading ? "Loading..." : error ? <span className="text-red-500">{error}</span> : cacheContent}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCacheContentModal;
