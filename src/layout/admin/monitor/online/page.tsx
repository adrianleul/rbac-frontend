import { useState, useEffect } from "react";
import { list as fetchOnlineUsers, forceLogout } from "../../../../api/monitor/online";
import Pagination from "../../../../components/Pagination";
import Table from "../../../../components/Table";
import { LogOut, RefreshCw } from "lucide-react";
import { useToast, toast } from "../../../../components/alert/Toast";
import ConfirmDeleteModal from "../../../../components/modal/ConfirmDeleteModal";
import { usePermission } from "../../../../utils/usePermisssion";

type OnlineUser = {
  sessionId: number;
  token: string;
  username: string;
  department: string;
  host: string;
  location: string;
  browser: string;
  os: string;
  loginTime: string;
};

const mapApiUserToOnlineUser = (apiUser: any): OnlineUser => ({
  sessionId: apiUser.tokenId,
  token: apiUser.tokenId,
  username: apiUser.userName,
  department: apiUser.deptName,
  host: apiUser.ipaddr,
  location: apiUser.loginLocation,
  browser: apiUser.browser,
  os: apiUser.os,
  loginTime: apiUser.loginTime,
});

const OnlineUsersPage = () => {
  const { showToast } = useToast();
  //Permission based rendering buttons
  const canForceLogout = usePermission('monitor:logininfor:remove');
  const showOperateColumn = canForceLogout;

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>("bulk");
  const [targetUser, setTargetUser] = useState<OnlineUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchOnlineUsers();
        const data = res.data || res;
        let users: OnlineUser[] = [];
        let total = 0;
        if (Array.isArray(data.rows)) {
          users = data.rows.map(mapApiUserToOnlineUser);
          total = data.rows.length;
        } else if (Array.isArray(data.data)) {
          users = data.data;
          total = data.data.length;
        }
        setOnlineUsers(users);
        setTotalItems(total);
      } catch (err: any) {
        setError(err.message || "Failed to load online users");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, itemsPerPage]);

  const columns = [
    { header: "Token", accessor: "token" },
    { header: "Username", accessor: "username" },
    { header: "Department", accessor: "department" },
    { header: "Host IP", accessor: "host" },
    { header: "Login Location", accessor: "location" },
    { header: "Browser", accessor: "browser" },
    { header: "Operating System", accessor: "os" },
    { header: "Login Time", accessor: "loginTime" },
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

  const handleOpenDeleteModal = (type: 'single' | 'bulk', user?: OnlineUser) => {
    setDeleteType(type);
    setTargetUser(user || null);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setTargetUser(null);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteType === 'single' && targetUser) {
        await forceLogout(String(targetUser.sessionId));
        showToast(toast.success(`User "${targetUser.username}" force logged out successfully.`));
      } else if (deleteType === 'bulk') {
        await Promise.all(selectedRows.map(id => forceLogout(String(id))));
        showToast(toast.success("Selected users force logged out successfully."));
        setSelectedRows([]);
      }
      // Refresh the online users list
      const res = await fetchOnlineUsers();
      const data = res.data || res;
      let users: OnlineUser[] = [];
      let total = 0;
      if (Array.isArray(data.rows)) {
        users = data.rows.map(mapApiUserToOnlineUser);
        total = data.rows.length;
      } else if (Array.isArray(data.data)) {
        users = data.data;
        total = data.data.length;
      }
      setOnlineUsers(users);
      setTotalItems(total);
      handleCloseDeleteModal();
    } catch (err: any) {
      showToast(toast.error(err?.message || "Failed to force logout user(s)."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForcedLogoutSelected = () => {
    if (selectedRows.length === 0) {
      showToast(toast.warning("No users selected for force logout."));
      return;
    }
    handleOpenDeleteModal('bulk');
  };

  const renderRow = (item: OnlineUser) => (
    <tr key={item.sessionId}
      className="text-sm hover:bg-slate-50 text-center">
      <td className="p-3 border-b border-gray-300">
        <input
          type="checkbox"
          checked={selectedRows.includes(item.sessionId)}
          onChange={(e) => handleSelectRow(item.sessionId, e.target.checked)}
          className="mx-auto"
        />
      </td>
      <td className="p-3 border-b border-gray-300">{item.token}</td>
      <td className="p-3 border-b border-gray-300">{item.username}</td>
      <td className="p-3 border-b border-gray-300">{item.department}</td>
      <td className="p-3 border-b border-gray-300">{item.host}</td>
      <td className="p-3 border-b border-gray-300">{item.location}</td>
      <td className="p-3 border-b border-gray-300">{item.browser}</td>
      <td className="p-3 border-b border-gray-300">{item.os}</td>
      <td className="p-3 border-b border-gray-300">{item.loginTime}</td>
      {showOperateColumn && (
        <td className="p-3 border-b border-gray-300">
          <button
            className="inline-flex items-center justify-center bg-red-200 hover:bg-red-400 rounded-md rounded-md w-8 h-8"
            title="Force Logout"
            onClick={() => handleOpenDeleteModal('single', item)}>
            <LogOut style={{ color: "red" }} />
          </button>
        </td>
      )}
    </tr>
  );

  return (
    <div className="rounded-md bg-gray-200 flex-1 m-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 justify-between rounded-md mb-4">
        <h1 className="text-lg font-semibold">Online Users Management</h1>
        <div className="flex flex-wrap gap-2">
          {showOperateColumn && (
            <button
              onClick={handleForcedLogoutSelected}
              className="min-w-[100px] h-10 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm flex items-center justify-center gap-2 p-2">
              <LogOut style={{ color: "white" }} />
              Force Logout User
            </button>
          )}
          <button
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const res = await fetchOnlineUsers();
                const data = res.data || res;
                let users: OnlineUser[] = [];
                let total = 0;
                if (Array.isArray(data.rows)) {
                  users = data.rows.map(mapApiUserToOnlineUser);
                  total = data.rows.length;
                } else if (Array.isArray(data.data)) {
                  users = data.data;
                  total = data.data.length;
                }
                setOnlineUsers(users);
                setTotalItems(total);
                showToast(toast.success("Online users list refreshed successfully."));
              } catch (err: any) {
                setError(err.message || "Failed to load online users");
                showToast(toast.error(err.message || "Failed to refresh online users"));
              } finally {
                setLoading(false);
              }
            }}
            className="min-w-[100px] h-10 bg-white text-black border hover:bg-gray-100 border-gray-300 rounded-md text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw style={{ color: "black" }} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center bg-white  justify-between rounded-md mb-4 w-full">
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center">Loading online users...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <Table
              columns={columns}
              data={onlineUsers.map((u) => ({ ...u, id: u.sessionId }))}
              renderRow={renderRow}
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
      />
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteType === 'bulk' ? 'Force Logout Selected Users' : 'Force Logout User'}
        message={
          deleteType === 'bulk'
            ? `Are you sure you want to force logout ${selectedRows.length} selected user(s)? This action cannot be undone.`
            : `Are you sure you want to force logout user "${targetUser?.username}"? This action cannot be undone.`
        }
        isLoading={isDeleting}
        iconColor={deleteType === 'bulk' && selectedRows.length === 0 ? 'text-yellow-500' : undefined}
        confirmLabel="Force Logout User"
      />
    </div>
  );
};

export default OnlineUsersPage;
