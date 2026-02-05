import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Button } from '../../../../components/ui/button';
import { UserPlus } from 'lucide-react';
import { getUserRoleNPost, addUser, getUser, updateUser } from '../../../../api/system/user';
import DepartmentTreeSelect from '../../../../components/ui/admin/Department';
import { useToast, toast } from "../../../../components/alert/Toast";
import { Textarea } from '../../../../components/ui/textarea';

interface Role {
  roleId: number;
  roleName: string;
}

interface Post {
  postId: number;
  postName: string;
}

interface AddUserModalProps {
  onUserAdded?: () => void;
  onUserUpdated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userId?: string | number | null;
}

export const UserModal: React.FC<AddUserModalProps> = ({ onUserAdded, onUserUpdated, open, onOpenChange, userId }) => {
  const { showToast } = useToast();
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickName, setNickname] = useState('');
  const [phonenumber, setPhone] = useState('');
  const [sex, setGender] = useState('0');
  const [status, setStatus] = useState('0');
  const [email, setEmail] = useState('');
  const [remark, setRemark] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeRef = useRef<HTMLButtonElement>(null);

  // Use controlled or uncontrolled open state
  const dialogOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = onOpenChange || setIsOpen;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles and posts
        const rolesResponse = await getUserRoleNPost();
        if (rolesResponse && rolesResponse.code === 200) {
          setRoles(rolesResponse.roles || []);
          setPosts(rolesResponse.posts || []);
        }
        // If editing, fetch user data
        if (userId) {
          const userRes = await getUser(String(userId));
          const user = userRes.data || userRes;
          setUsername(user.userName || '');
          setPassword(''); // Don't prefill password
          setNickname(user.nickName || '');
          setPhone(user.phonenumber || '');
          setGender(user.sex?.toString() || '0');
          setStatus(user.status?.toString() || '0');
          setEmail(user.email || '');
          setRemark(user.remark || '');
          setSelectedRoles((user.roleIds || user.roles || []).map((r: any) => String(r.roleId || r)));
          setSelectedPositions((user.postIds || user.posts || []).map((p: any) => String(p.postId || p)));
          setSelectedDepartmentId(user.deptId || (user.dept && user.dept.deptId) || null);
        } else {
          // Reset form for add mode
          setUsername('');
          setPassword('');
          setNickname('');
          setPhone('');
          setGender('0');
          setStatus('0');
          setEmail('');
          setRemark('');
          setSelectedRoles([]);
          setSelectedPositions([]);
          setSelectedDepartmentId(null);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to fetch data';
        showToast(toast.error(msg));
      }
    };
    if (dialogOpen) {
      fetchData();
    }
  }, [dialogOpen, userId]);

  const toggleCheckbox = (value: string, state: string[], setState: (val: string[]) => void) => {
    setState(
      state.includes(value)
        ? state.filter((item) => item !== value)
        : [...state, value]
    );
  };

  const handleDepartmentChange = (deptId: number | null, deptName?: string) => {
    setSelectedDepartmentId(deptId);
  };

  const handleSubmit = async () => {
    if (!userName.trim()) {
      showToast(toast.error('Username cannot be empty'));
      return;
    }
    if (!nickName.trim()) {
      showToast(toast.error('Nickname cannot be empty'));
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = {
        userId: userId || undefined,
        userName,
        password: password || undefined, // Only send if set
        nickName,
        phonenumber,
        email,
        sex,
        status,
        roleIds: selectedRoles,
        postIds: selectedPositions,
        deptId: selectedDepartmentId,
        remark,
      };
      let response;
      if (userId) {
        // Edit mode
        response = await updateUser(formData);
      } else {
        // Add mode
        response = await addUser(formData);
      }
      if (response && response.code === 200) {
        showToast(toast.success(userId ? 'User updated successfully!' : 'User added successfully!'));
        if (userId && onUserUpdated) onUserUpdated();
        if (!userId && onUserAdded) onUserAdded();
        closeRef.current?.click();
      } else {
        showToast(toast.error(response?.msg || (userId ? 'Failed to update user' : 'Failed to add user')));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (userId ? 'Failed to update user' : 'Failed to add user');
      showToast(toast.error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        {/* Only render trigger if using uncontrolled mode */}
        {open === undefined && (
          <DialogTrigger  >
            <button className="h-10 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm gap-2">
              <UserPlus style={{ color: "white" }} />
              Add User
            </button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-[800px]" style={{ top: 24 }} width={1000} footer={null} >
          <DialogTitle>{userId ? 'Edit User' : 'Add New User'}</DialogTitle>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Input placeholder="Username" value={userName} onChange={(e) => setUsername(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input placeholder="Nickname" value={nickName} onChange={(e) => setNickname(e.target.value)} />
            <Input placeholder="Phone Number" value={phonenumber} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-2" />
            <div className="col-span-2">
              <label className="block mb-1 font-medium">Select Department</label>
              <DepartmentTreeSelect
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                placeholder="Select a department"
                allowClear={true}
                size="md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Gender</label>
              <RadioGroup
                value={sex}
                onValueChange={setGender}
                className="flex items-center gap-4 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="gender-male" />
                  <label htmlFor="gender-male" className="text-sm">
                    Male
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="gender-female" />
                  <label htmlFor="gender-female" className="text-sm">
                    Female
                  </label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <RadioGroup
                value={status}
                onValueChange={setStatus}
                className="flex items-center gap-4 mt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="status-active" />
                  <label htmlFor="status-active" className="text-sm">
                    Active
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="status-inactive" />
                  <label htmlFor="status-inactive" className="text-sm">
                    Inactive
                  </label>
                </div>
              </RadioGroup>
            </div>
            <div className="col-span-1">
              <label className="block mb-1 font-medium">Roles</label>
              <div className="border rounded-md p-2">
                {roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <label key={role.roleId} className="flex items-center gap-2 mb-2">
                      <Checkbox
                        checked={selectedRoles.includes(String(role.roleId))}
                        onChange={() =>
                          toggleCheckbox(String(role.roleId), selectedRoles, setSelectedRoles)
                        }
                      />
                      <span className="text-sm">{role.roleName}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No roles available</div>
                )}
              </div>
            </div>
            <div className="col-span-1">
              <label className="block mb-1 font-medium">Positions</label>
              <div className="border rounded-md p-2">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <label key={post.postId} className="flex items-center gap-2 mb-2">
                      <Checkbox
                        checked={selectedPositions.includes(String(post.postId))}
                        onChange={() =>
                          toggleCheckbox(String(post.postId), selectedPositions, setSelectedPositions)
                        }
                      />
                      <span className="text-sm">{post.postName}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No positions available</div>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block mb-1 font-medium">Remark</label>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                className="w-full border rounded-md p-2 text-sm"
                placeholder="Enter any notes or remarks here..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose  >
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <DialogClose  >
              <button ref={closeRef} className="hidden" />
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (userId ? 'Saving...' : 'Adding...') : (userId ? 'Save' : 'Submit')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
