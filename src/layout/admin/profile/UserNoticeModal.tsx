import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import Table from '../../../components/Table';
import Pagination from '../../../components/Pagination';
import { listUserNotice } from '../../../api/system/notice';
import OperationButtons from '../../../components/ui/admin/OperationButtons';
import ViewNoticeModal from './ViewNoticeModal';

interface UserNoticeModalProps {
  open: boolean;
  onClose: () => void;
}

const UserNoticeModal: React.FC<UserNoticeModalProps> = ({ open, onClose }) => {
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  useEffect(() => {
    if (open) {
      fetchNotices();
    }
    // eslint-disable-next-line
  }, [open, currentPage, itemsPerPage]);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const response = await listUserNotice({
        pageNum: currentPage,
        pageSize: itemsPerPage,
      });
      let noticeData: any[] = [];
      let totalCount = 0;
      if (Array.isArray(response)) {
        noticeData = response;
        totalCount = response.length;
      } else if (response && typeof response === 'object') {
        const data = response as any;
        totalCount = data.total || data.totalCount || data.count || 0;
        let rawData: any[] = [];
        if (Array.isArray(data.rows)) rawData = data.rows;
        else if (Array.isArray(data.list)) rawData = data.list;
        else if (Array.isArray(data.records)) rawData = data.records;
        else if (Array.isArray(data.data)) rawData = data.data;
        noticeData = rawData.map(item => ({
          noticeId: item.noticeId || item.id || 0,
          noticeTitle: item.noticeTitle || item.name || '',
          noticeContent: item.noticeContent || '',
          noticeType: item.noticeType || '',
          createTime: item.createTime || '',
          seen: item.seen || '',
        }));
      }
      setNotices(noticeData);
      setTotalItems(totalCount);
    } catch (error) {
      setNotices([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNotice = (notice: any) => {
    setSelectedNotice(notice);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedNotice(null);
    fetchNotices(); // Refresh to update seen status
  };

  const columns = [
    { header: 'Title', accessor: 'noticeTitle' },
    { header: 'Type', accessor: 'noticeType' },
    { header: 'Creation Time', accessor: 'createTime' },
    { header: 'Seen?', accessor: 'seen' },
    { header: 'Operate', accessor: 'noticeContent' },
  ];

  const renderRow = (notice: any) => (
    <tr key={notice.noticeId} className="text-sm hover:bg-slate-50 text-center">
      <td className="p-3 border-b border-gray-300">{notice.noticeTitle}</td>
      <td className="p-3 border-b border-gray-300">
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          notice.noticeType === "0"
          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
          : notice.noticeType === "1"
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : notice.noticeType === "2"
          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}>
          {notice.noticeType === "0"
            ? "Announcement"
            : notice.noticeType === "1"
            ? "Notice"
            : notice.noticeType === "2"
            ? "Warning"
            : notice.noticeType === "3"
            ? "Danger"
            : "Unknown"}
        </span>
      </td>
      <td className="p-3 border-b border-gray-300">{notice.createTime}</td>
      <td className="p-3 border-b border-gray-300">{notice.seen ? 'Seen' : 'Not Seen'}</td>
      <td className="p-3 border-b border-gray-300">
        <OperationButtons
        viewTitle='View Notice'
          onView={() => handleViewNotice(notice)}
        />
      </td>
    </tr>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ top: 34 }} width={700} footer={null}>
        <DialogHeader>
          <DialogTitle>User Notices</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <Table
              columns={columns}
              renderRow={renderRow}
              data={notices.map(n => ({ ...n, id: n.noticeId }))}
            />
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          showItemCount={true}
          showItemsPerPage={true}
          itemsPerPageOptions={[10, 20, 30, 50]}
          maxVisiblePages={5}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
      {selectedNotice && (
        <ViewNoticeModal
          open={viewModalOpen}
          onClose={handleCloseViewModal}
          noticeId={selectedNotice.noticeId}
          noticeTitle={selectedNotice.noticeTitle}
          noticeContent={selectedNotice.noticeContent}
          seen={!!selectedNotice.seen}
        />
      )}
    </Dialog>
  );
};

export default UserNoticeModal;
