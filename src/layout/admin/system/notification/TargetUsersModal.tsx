import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import Table from '../../../../components/Table';
import Pagination from '../../../../components/Pagination';
import { listUser } from '../../../../api/system/user';
import { Input } from '../../../../components/ui/input';
import { Search, FilterIcon, RefreshCw } from 'lucide-react';

interface User {
  userId: number;
  username: string;
  phone: string;
  department: string;
  status: '0' | '1';
  createTime: string;
}

interface TargetUsersModalProps {
  open: boolean;
  onClose: () => void;
  selectedUsers: User[];
  setSelectedUsers: (users: User[]) => void;
}

const TargetUsersModal: React.FC<TargetUsersModalProps> = ({ open, onClose, selectedUsers, setSelectedUsers }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ userName: '', phonenumber: '' });
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedRows, setSelectedRows] = useState<number[]>(selectedUsers.map(u => u.userId));

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSelectedRows(selectedUsers.map(u => u.userId));
    }
    // eslint-disable-next-line
  }, [open, currentPage, itemsPerPage, activeFilters]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await listUser({
        pageNum: currentPage,
        pageSize: itemsPerPage,
        ...activeFilters
      });
      let userData: User[] = [];
      let totalCount = 0;
      if (Array.isArray(response)) {
        userData = response;
        totalCount = response.length;
      } else if (response && typeof response === 'object') {
        const data = response as any;
        totalCount = data.total || data.totalCount || data.count || 0;
        let rawData: any[] = [];
        if (Array.isArray(data.rows)) rawData = data.rows;
        else if (Array.isArray(data.list)) rawData = data.list;
        else if (Array.isArray(data.records)) rawData = data.records;
        else if (Array.isArray(data.data)) rawData = data.data;
        userData = rawData.map(item => ({
          userId: item.userId || item.id || 0,
          username: item.username || item.userName || item.name || '',
          phone: item.phone || item.phonenumber || item.contact || '',
          department: item.dept?.deptName || item.department || '',
          status: item.status?.toString() || '0',
          createTime: item.createTime || item.createdAt || item.createDate || new Date().toISOString()
        }));
      }
      setUsers(userData);
      setTotalItems(totalCount);
    } catch (error) {
      setUsers([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: 'User ID', accessor: 'userId' },
    { header: 'Username', accessor: 'username' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Department', accessor: 'department' },
    { header: 'Status', accessor: 'status' },
    { header: 'Created', accessor: 'createTime' },
  ];

  const handleSelectRow = (id: number | null, checked: boolean, bulkIds?: number[]) => {
    if (Array.isArray(bulkIds)) {
      setSelectedRows(checked ? bulkIds : []);
      return;
    }
    setSelectedRows(prev => checked ? [...prev, id!] : prev.filter(rowId => rowId !== id));
  };

  const renderRow = (user: User) => (
    <tr key={user.userId} className="text-sm hover:bg-slate-50 text-center">
      <td className="p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(user.userId)}
          onChange={e => handleSelectRow(user.userId, e.target.checked)}
          className="mx-auto"
        />
      </td>
      <td className="p-3 border-b border-gray-300">{user.userId}</td>
      <td className="p-3 border-b border-gray-300">{user.username}</td>
      <td className="p-3 border-b border-gray-300">{user.phone}</td>
      <td className="p-3 border-b border-gray-300">{user.department}</td>
      <td className="p-3 border-b border-gray-300">
        <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${user.status === '0' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>{user.status === '0' ? 'Active' : 'Inactive'}</span>
      </td>
      <td className="p-3 border-b border-gray-300">{user.createTime}</td>
    </tr>
  );

  const handleFilter = () => {
    setActiveFilters(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')));
    setCurrentPage(1);
  };
  const handleResetFilters = () => {
    setFilters({ userName: '', phonenumber: '' });
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handleSave = () => {
    setSelectedUsers(users.filter(u => selectedRows.includes(u.userId)));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full" footer={null} width={1000}>
        <DialogHeader>
          <DialogTitle>Select Users</DialogTitle>
        </DialogHeader>
        <div className="bg-white p-4 rounded-md mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={filters.userName}
                  placeholder="Filter by Username"
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200"
                  onChange={e => setFilters(f => ({ ...f, userName: e.target.value }))}
                />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={filters.phonenumber}
                  placeholder="Filter by Phone"
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200"
                  onChange={e => setFilters(f => ({ ...f, phonenumber: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <Button variant="outline" onClick={handleFilter}>
                <FilterIcon className="w-4 h-4 mr-1" /> Filter
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>
                <RefreshCw className="w-4 h-4 mr-1" /> Reset
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center bg-white justify-between rounded-md mb-4 w-full">
          <div className="w-full overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <Table
                columns={columns}
                renderRow={renderRow}
                data={users.map(u => ({ ...u, id: u.userId }))}
                selectable
                selectedRows={selectedRows}
                onSelectRow={handleSelectRow}
              />
            )}
          </div>
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={selectedRows.length === 0}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TargetUsersModal;
