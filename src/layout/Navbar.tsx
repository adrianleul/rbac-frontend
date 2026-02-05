import React from "react";
import { Bell, Maximize, Minimize } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { useEffect, useState } from "react";
import { getUserAvatar, getUserProfile } from "../api/system/user";
import UserProfileModal from "./admin/profile/UserProfileModal";
import { logoutUser } from "../features/user/userSlice";
import UserNoticeModal from "./admin/profile/UserNoticeModal";
import { getUnseenNoticeCount } from '../api/system/notice';

const DEFAULT_AVATAR = "/Public/app/defaultAvatar.avif";

const FullScreenButton: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleToggleFullScreen = () => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  React.useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
    };
  }, []);

  return (
    <button
      onClick={handleToggleFullScreen}
      className="px-2 py-1 rounded text-black transition mx-2 flex items-center justify-center"
      title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
    >
      {isFullScreen ? <Minimize size={30} /> : <Maximize size={30} />}
    </button>
  );
};

const Navbar = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [menuOpen, setMenuOpen] = useState(false);
  let menuCloseTimeout: ReturnType<typeof setTimeout> | null = null;
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(user);
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    let objectUrl: string | undefined;
    if (!user.avatar || user.avatar === DEFAULT_AVATAR) {
      setAvatarUrl(DEFAULT_AVATAR);
      return;
    }
    getUserAvatar(user.avatar)
      .then((response: any) => {
        if (response instanceof Blob) {
          objectUrl = URL.createObjectURL(response);
          setAvatarUrl(objectUrl);
        } else {
          setAvatarUrl(DEFAULT_AVATAR);
        }
      })
      .catch(() => setAvatarUrl(DEFAULT_AVATAR));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user.avatar, avatarRefreshKey]);

  useEffect(() => {
    const fetchUnseen = async () => {
      try {
        const count = await getUnseenNoticeCount();
        setUnseenCount(count);
      } catch {
        setUnseenCount(0);
      }
    };
    fetchUnseen();
  }, []);

  const handleProfileClick = async () => {
    setProfileLoading(true);
    setMenuOpen(false);
    try {
      const response = await getUserProfile();
      setProfileUser(response.data || user);
    } catch {
      setProfileUser(user);
    }
    setProfileLoading(false);
    setProfileOpen(true);
  };

  const handleLogoutClick = async () => {
    setMenuOpen(false);
    await dispatch<any>(logoutUser());
    window.location.href = "/login";
  };

  const handleMenuMouseEnter = () => {
    if (menuCloseTimeout) clearTimeout(menuCloseTimeout);
    setMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    menuCloseTimeout = setTimeout(() => setMenuOpen(false), 250);
  };

  const handleAvatarUpdate = () => {
    setAvatarRefreshKey(prev => prev + 1);
  };

  const handleNoticeModalClose = () => {
    setNoticeModalOpen(false);
    // Refresh unseen count after closing modal
    getUnseenNoticeCount().then(setUnseenCount);
  };

  return (
    <div className='flex items-center justify-between p-4'>
      <div className='flex items-center gap-6 justify-end w-full'>
        <div title="Notification" className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative' onClick={() => setNoticeModalOpen(true)}>
          <Bell size={30} />
          {unseenCount > 0 && (
            <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-green-500 text-white rounded-full text-xs'>{unseenCount}</div>
          )}
        </div>
        <FullScreenButton />
        <div className='flex flex-col'>
          <span className="text-xs leading-3 font-medium">{user.nickname || "-"}</span>
          <span className="text-[10px] text-gray-500 text-right">{user.name || "-"}</span>
        </div>
        <div
          className="relative"
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        >
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover border border-gray-300 cursor-pointer"
          />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleProfileClick}>My Profile</button>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleLogoutClick}>Logout</button>
            </div>
          )}
        </div>
      </div>
      <UserProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={profileUser}
        avatarUrl={avatarUrl}
        onAvatarUpdate={handleAvatarUpdate}
      />
      <UserNoticeModal open={noticeModalOpen} onClose={handleNoticeModalClose} />
    </div>
  );
};

export default Navbar;