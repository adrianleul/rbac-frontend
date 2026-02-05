import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { markSeen } from '../../../api/system/notice';

interface ViewNoticeModalProps {
  open: boolean;
  onClose: () => void;
  noticeId: string;
  noticeTitle: string;
  noticeContent: string;
  seen: boolean;
}

const ViewNoticeModal: React.FC<ViewNoticeModalProps> = ({ open, onClose, noticeId, noticeTitle, noticeContent, seen }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (open && noticeId && !seen) {
      setLoading(true);
      markSeen(noticeId)
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [open, noticeId, seen]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ top: 34 }} width={600} footer={null}>
        <DialogHeader>
          <DialogTitle>{noticeTitle}</DialogTitle>
        </DialogHeader>
        <div className="py-4 px-2 min-h-[120px] max-h-[400px] overflow-auto border rounded bg-gray-50 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
              <span className="text-gray-500 text-sm">Marking as seen...</span>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: noticeContent }} className="w-full" />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNoticeModal;
