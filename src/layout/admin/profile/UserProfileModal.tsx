import React, { useState, useEffect } from "react";
import { Input } from "../../../components/ui/input";
import { getUserProfile, updateUserProfile, updateUserPassword, updateUserAvatar } from '../../../api/system/user';
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { useToast, toast } from "../../../components/alert/Toast";
import EditAvatarModal from "./EditAvatarModal";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
  avatarUrl: string;
  onAvatarUpdate?: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ open, onClose, user, avatarUrl, onAvatarUpdate }) => {
  const [tab, setTab] = useState<'personal' | 'password'>('personal');
  const [personalInfo, setPersonalInfo] = useState({
    nickname: user.nickname || '',
    name: user.name || '',
    phonenumber: user.phonenumber || '',
    email: user.email || '',
    gender: user.gender || '',
    dept: user.dept || '',
    roles: user.roles || '',
  });
  const [passwordInfo, setPasswordInfo] = useState({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(user);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editAvatarOpen, setEditAvatarOpen] = useState(false);

  const { showToast } = useToast();

  // Avatar upload API
  const uploadAvatar = async (data: any) => {
    try {
      await updateUserAvatar(data);
      showToast(toast.success('Avatar updated successfully!'));
      // Refresh user profile to get updated avatar
      const response = await getUserProfile();
      setProfileUser(response.data || user);
      // Notify parent component to refresh avatar
      if (onAvatarUpdate) {
        onAvatarUpdate();
      }
    } catch (error: any) {
      showToast(toast.error(error.message || 'Failed to update avatar.'));
    }
  };

  useEffect(() => {
    if (open) {
      setProfileLoading(true);
      getUserProfile()
        .then((response: any) => {
          const data = response.data || user;
          setProfileUser(data);
          setPersonalInfo({
            name: data.userName || '',
            nickname: data.nickname || data.nickName || '',
            phonenumber: data.phonenumber || '',
            email: data.email || '',
            gender: data.sex || '',
            dept: data.dept?.deptName || '',
            roles: Array.isArray(data.roles) ? data.roles.map((r: any) => r.roleName).join(', ') : '',
          });
        })
        .catch(() => {
          setProfileUser(user);
        })
        .finally(() => setProfileLoading(false));
    }
  }, [open, user]);

  // Handle update personal info
  const handleUpdateInfo = async () => {
    setSubmitLoading(true);
    try {
      await updateUserProfile({
        nickName: personalInfo.nickname,
        phonenumber: personalInfo.phonenumber,
        email: personalInfo.email,
        sex: personalInfo.gender,
      });
      showToast(toast.success('Profile updated successfully!'));
    } catch (err: any) {
      showToast(toast.error('Failed to update profile.'));
    }
    setSubmitLoading(false);
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!passwordInfo.oldPassword || !passwordInfo.newPassword || !passwordInfo.repeatPassword) {
      showToast(toast.error('Please fill all password fields.'));
      return;
    }
    if (passwordInfo.newPassword !== passwordInfo.repeatPassword) {
      showToast(toast.error('New passwords do not match.'));
      return;
    }
    setSubmitLoading(true);
    try {
      await updateUserPassword(passwordInfo.oldPassword, passwordInfo.newPassword);
      showToast(toast.success('Password changed successfully!'));
      setPasswordInfo({ oldPassword: '', newPassword: '', repeatPassword: '' });
    } catch (err: any) {
      showToast(toast.error('Failed to change password.'));
    }
    setSubmitLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent footer={null} width={500} className="max-w-lg">
        <div className="relative mb-4 flex flex-col items-center">
          <div className="group relative">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border border-gray-300 mb-2 cursor-pointer"
              onClick={() => setEditAvatarOpen(true)}
            />
            <div className="w-20 h-20 absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
              onClick={() => setEditAvatarOpen(true)}>
              <span className="text-white text-xs font-semibold">Edit Avatar</span>
            </div>
          </div>
          <div className="font-bold text-lg mb-1">{personalInfo.nickname || '-'}</div>
          <div className="text-gray-500 text-sm mb-1">{personalInfo.name || '-'}</div>
        </div>
        <EditAvatarModal
          open={editAvatarOpen}
          onClose={() => setEditAvatarOpen(false)}
          avatarUrl={avatarUrl}
          onAvatarChange={async (file) => {
            await uploadAvatar(file);
            setEditAvatarOpen(false);
          }}
        />
        <div className="mt-6 flex flex-col items-center mb-4">
          <div className="text-xs text-gray-500 mb-1">Department: <span className="text-gray-700">{personalInfo.dept || '-'}</span></div>
          <div className="text-xs text-gray-500 mb-1">Roles: <span className="text-gray-700">{personalInfo.roles || '-'}</span></div>
          <div className="text-xs text-gray-500 mb-1">Created at: <span className="text-gray-700">{profileUser.createTime || '-'}</span></div>
        </div>
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-l ${tab === 'personal' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('personal')}
          >
            Personal Info
          </button>
          <button
            className={`px-4 py-2 rounded-r ${tab === 'password' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('password')}
          >
            Change Password
          </button>
        </div>
        {profileLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : tab === 'personal' ? (
          <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleUpdateInfo(); }}>
            <div>
              <label className="block text-xs text-gray-500">Nickname</label>
              <Input className="w-full border rounded px-2 py-1" value={personalInfo.nickname} onChange={e => setPersonalInfo({ ...personalInfo, nickname: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Phone Number</label>
              <Input className="w-full border rounded px-2 py-1" value={personalInfo.phonenumber} onChange={e => setPersonalInfo({ ...personalInfo, phonenumber: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Email</label>
              <Input className="w-full border rounded px-2 py-1" value={personalInfo.email} onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Gender</label>
              <RadioGroup
                value={personalInfo.gender}
                onValueChange={(value) => setPersonalInfo({ ...personalInfo, gender: value })}
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
            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded mt-2" disabled={submitLoading}>{submitLoading ? 'Updating...' : 'Update Info'}</button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleChangePassword(); }}>
            <div>
              <label className="block text-xs text-gray-500">Old Password</label>
              <Input type="password" className="w-full border rounded px-2 py-1" value={passwordInfo.oldPassword} onChange={e => setPasswordInfo({ ...passwordInfo, oldPassword: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500">New Password</label>
              <Input type="password" className="w-full border rounded px-2 py-1" value={passwordInfo.newPassword} onChange={e => setPasswordInfo({ ...passwordInfo, newPassword: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Repeat Password</label>
              <Input type="password" className="w-full border rounded px-2 py-1" value={passwordInfo.repeatPassword} onChange={e => setPasswordInfo({ ...passwordInfo, repeatPassword: e.target.value })} />
            </div>
            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded mt-2" disabled={submitLoading}>{submitLoading ? 'Changing...' : 'Change Password'}</button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal; 