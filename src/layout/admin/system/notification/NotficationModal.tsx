import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";
import { addNotice } from "../../../../api/system/notice";
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import React from 'react';
import DepartmentTreeSelect from "../../../../components/ui/admin/Department";
import TargetUsersModal from './TargetUsersModal';
import { listRole } from '../../../../api/system/role';
import { useEffect } from 'react';
import { useToast, toast } from "../../../../components/alert/Toast";
import { getUser } from '../../../../api/system/user';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../../components/ui/select";

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

interface AddNoticeModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (newNotice: Notice) => void;
  isEdit?: boolean;
  editNotice?: Notice | null;
  onEdit?: (updatedNotice: Notice) => void;
  fetchNotices?: () => void;
  editTargets?: any[]; // <-- add this line
}

const NoticeModal = ({ open, onClose, onAdd, isEdit = false, editNotice = null, onEdit, fetchNotices, editTargets = [] }: AddNoticeModalProps) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<{
    noticeTitle: string;
    noticeType: "0" | "1" | "2" | "3" | "";
    status: "0" | "1";
    noticeContent: string;
  }>({
    noticeTitle: "",
    noticeType: "",
    status: "0",
    noticeContent: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetType, setTargetType] = useState<'users' | 'roles' | 'departments'>('users');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]); // Changed to any[] to match User type
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [roles, setRoles] = useState<{ roleId: number; roleName: string }[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const prevOpen = React.useRef(open);

  React.useEffect(() => {
    if (isEdit && editNotice) {
      setFormData({
        noticeTitle: editNotice.noticeTitle || "",
        noticeType: ["0", "1", "2", "3"].includes(String(editNotice.noticeType)) ? String(editNotice.noticeType) as "0" | "1" | "2" | "3" : "",
        status: editNotice.status || "0",
        noticeContent: editNotice.noticeContent || "",
      });
      // Prefill targets if provided
      if (Array.isArray(editTargets) && editTargets.length > 0) {
        const userIds = editTargets.filter(t => t.targetUserId).map(t => t.targetUserId);
        const deptIds = editTargets.filter(t => t.targetDeptId).map(t => t.targetDeptId);
        const roleIds = editTargets.filter(t => t.targetRoleId).map(t => t.targetRoleId);
        // For users, fetch real user data from backend
        if (userIds.length > 0) {
          Promise.all(userIds.map((id: number) => getUser(String(id)).then(res => {
            const data = res.data || res;
            return {
              userId: data.userId || id,
              username: data.username || data.userName || `User #${id}`,
              phone: data.phone || data.phonenumber || '',
              department: data.dept?.deptName || data.department || '',
              status: data.status?.toString() || '0',
              createTime: data.createTime || data.createdAt || data.createDate || new Date().toISOString(),
            };
          }).catch(() => ({ userId: id, username: `User #${id}` }))))
            .then(users => setSelectedUsers(users));
        } else {
          setSelectedUsers([]);
        }
        setSelectedDepartments(deptIds);
        setSelectedRoles(roleIds);
        // Optionally, set targetType to the first available
        if (userIds.length > 0) setTargetType('users');
        else if (roleIds.length > 0) setTargetType('roles');
        else if (deptIds.length > 0) setTargetType('departments');
      }
    } else if (!isEdit && open && !prevOpen.current) {
      setFormData({
        noticeTitle: "",
        noticeType: "", // empty string for placeholder
        status: "0",
        noticeContent: "",
      });
      setSelectedUsers([]);
      setSelectedDepartments([]);
      setSelectedRoles([]);
    }
    prevOpen.current = open;
  }, [isEdit, editNotice, open, editTargets]);

  useEffect(() => {
    if (targetType === 'roles') {
      setRolesLoading(true);
      listRole({ pageNum: 1, pageSize: 100 }).then(res => {
        let roleList: any[] = [];
        if (Array.isArray(res)) {
          roleList = res;
        } else if (res && typeof res === 'object') {
          const data = res as any;
          if (Array.isArray(data.rows)) roleList = data.rows;
          else if (Array.isArray(data.list)) roleList = data.list;
          else if (Array.isArray(data.records)) roleList = data.records;
          else if (Array.isArray(data.data)) roleList = data.data;
        }
        setRoles(roleList.map((r: any) => ({ roleId: r.roleId, roleName: r.roleName })));
      }).finally(() => setRolesLoading(false));
    }
  }, [targetType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, noticeContent: value }));
  };

  const handleSubmit = async () => {
    if (!formData.noticeTitle || !formData.noticeContent) {
      alert("Please fill in required fields.");
      return;
    }
    // Build targets array
    const targets: Array<{ targetUserId?: number; targetDeptId?: number; targetRoleId?: number }> = [];
    selectedUsers.forEach(user => {
      if (user.userId) targets.push({ targetUserId: user.userId });
    });
    selectedDepartments.forEach(deptId => {
      if (deptId) targets.push({ targetDeptId: deptId });
    });
    selectedRoles.forEach(roleId => {
      if (roleId) targets.push({ targetRoleId: roleId });
    });
    if (targets.length === 0) {
      alert("Please select at least one target (user, role, or department).");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit && onEdit && editNotice) {
        // Edit mode
        const payload = {
          ...editNotice,
          ...formData,
          targets,
        };
        await onEdit(payload as Notice);
        onClose();
        setSelectedUsers([]);
        setSelectedDepartments([]);
        setSelectedRoles([]);
        if (typeof fetchNotices === 'function') fetchNotices();
        toast.success('Notification updated successfully!');
      } else if (!isEdit && onAdd) {
        // Add mode
        const payload = {
          ...formData,
          targets,
        };
        const res = await addNotice(payload);
        if (res && res.code === 200) {
          const newNotice = res.data ? { ...formData, ...res.data } : { ...formData };
          onAdd(newNotice as Notice);
          onClose();
          setFormData({
            noticeTitle: "",
            noticeType: "0",
            status: "0",
            noticeContent: "",
          });
          setSelectedUsers([]);
          setSelectedDepartments([]);
          setSelectedRoles([]);
          if (typeof fetchNotices === 'function') fetchNotices();
          toast.success('Notification added successfully!');
        } else {
          alert(res?.msg || "Failed to add notice.");
        }
      }
    } catch (err: any) {
      alert(err?.message || (isEdit ? "Failed to update notice." : "Failed to add notice."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ top: 34 }} width={800} footer={null}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Notice" : "Add New Notice"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Input
            name="noticeTitle"
            value={formData.noticeTitle}
            onChange={handleChange}
            placeholder="Notice Title"
            required
          />
          {/* Notice Type Select */}
          <Select value={formData.noticeType} onValueChange={value => setFormData(prev => ({ ...prev, noticeType: value as "0" | "1" | "2" | "3" }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Notice Type" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="0">Announcement</SelectItem>
              <SelectItem value="1">Notice</SelectItem>
              <SelectItem value="2">Warning</SelectItem>
              <SelectItem value="3">Danger</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-4">
            <label>Status:</label>
            <RadioGroup
              name="status"
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as "0" | "1" }))}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="0" id="notice-status-active" />
                <label htmlFor="notice-status-active" className="text-sm">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1" id="notice-status-inactive" />
                <label htmlFor="notice-status-inactive" className="text-sm">Inactive</label>
              </div>
            </RadioGroup>
          </div>

          <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 mb-4 rounded">
            <label className="font-medium">Notice Target</label>
            <div className="flex gap-4 mb-2">
              <button className={`px-3 py-1 rounded ${targetType === 'users' ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => setTargetType('users')}>Users</button>
              <button className={`px-3 py-1 rounded ${targetType === 'roles' ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => setTargetType('roles')}>Roles</button>
              <button className={`px-3 py-1 rounded ${targetType === 'departments' ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => setTargetType('departments')}>Department</button>
            </div>
            {targetType === 'users' && (
              <div>
                {selectedUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedUsers.map(user => (
                      <span key={user.userId} className="bg-gray-100 px-2 py-1 rounded text-sm">{user.username}</span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 mb-2">No users selected.</div>
                )}
                <Button onClick={() => setIsUserModalOpen(true)}>Select Users</Button>
                <TargetUsersModal open={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
              </div>
            )}
            {targetType === 'roles' && (
              <div className="flex flex-col gap-2">
                {rolesLoading ? (
                  <div className="text-gray-500">Loading roles...</div>
                ) : roles.length === 0 ? (
                  <div className="text-gray-500">No roles found.</div>
                ) : roles.map(role => (
                  <label key={role.roleId} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.roleId)}
                      onChange={e => {
                        setSelectedRoles(prev => e.target.checked ? [...prev, role.roleId] : prev.filter(id => id !== role.roleId));
                      }}
                    />
                    {role.roleName}
                  </label>
                ))}
              </div>
            )}
            {targetType === 'departments' && (
              <div>
                <DepartmentTreeSelect
                  value={null}
                  onChange={(deptId) => {
                    setSelectedDepartments(prev => prev.includes(deptId!) ? prev.filter(id => id !== deptId) : [...prev, deptId!]);
                  }}
                  placeholder="Select departments (multi-select)"
                  allowClear={false}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDepartments.map(id => (
                    <span key={id} className="bg-gray-100 px-2 py-1 rounded text-sm">Dept #{id}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label className="font-medium">Notice Content</label>
          <div className="h-56 mb-4 break-words overflow-x-auto">
            <ReactQuill
              value={formData.noticeContent}
              onChange={handleContentChange}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'size': ['small', false, 'large', 'huge'] }],
                  [{ 'align': [] }],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['clean']
                ]
              }}
              formats={['header', 'bold', 'italic', 'underline', 'color', 'background', 'size', 'align', 'list', 'bullet', 'clean']}
              className="bg-white h-full rounded border break-words"
              theme="snow"
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save" : "Add")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeModal;
