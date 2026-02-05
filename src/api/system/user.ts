import request from "../../utils/request";
import { parseStrEmpty } from "../../utils/config";

interface ListUserParams {
  pageNum?: number;
  pageSize?: number;
  userName?: string;
  phonenumber?: string;
  status?: string;
  deptId?: number;
  beginTime?: string;
  endTime?: string;
}

export const listUser = async (params?: ListUserParams) => {
  const queryParams = new URLSearchParams();

  if (params?.pageNum) {
    queryParams.append('pageNum', params.pageNum.toString());
  }

  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }

  if (params?.userName) {
    queryParams.append('userName', params.userName);
  }

  if (params?.phonenumber) {
    queryParams.append('phonenumber', params.phonenumber);
  }

  if (params?.status) {
    queryParams.append('status', params.status);
  }

  if (params?.deptId) {
    queryParams.append('deptId', params.deptId.toString());
  }

  if (params?.beginTime) {
    queryParams.append('params[beginTime]', params.beginTime);
  }

  if (params?.endTime) {
    queryParams.append('params[endTime]', params.endTime);
  }

  const queryString = queryParams.toString();
  const url = `/system/user/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

interface UserRolePostResponse {
  code: number;
  roles: any[];
  posts: any[];
}

export const getUserRoleNPost = async (): Promise<UserRolePostResponse> => {
  return request.get('/system/user/');
};

export const getUser = async (UserId: string) => {
  const safeUserId = parseStrEmpty(UserId);
  if (!safeUserId) {
    throw new Error('Invalid UserId');
  }
  return request.get(`/system/user/${safeUserId}`);
};

interface AddUserResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const addUser = async (data: any): Promise<AddUserResponse> => {
  return request.post('/system/user', data);
};

interface UpdateUserResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const updateUser = async (data: any): Promise<UpdateUserResponse> => {
  return request.put('/system/user', data);
};

export const deleteUser = async (userIds: string | string[]) => {
  let safeUserIds: string;

  if (Array.isArray(userIds)) {
    // For bulk deletion, join with commas
    safeUserIds = userIds.map(id => parseStrEmpty(id)).filter(Boolean).join(',');
  } else {
    // For single user deletion
    safeUserIds = parseStrEmpty(userIds);
  }

  if (!safeUserIds) {
    throw new Error('Invalid UserId(s)');
  }

  return request.delete(`/system/user/${safeUserIds}`);
};

export const resetPassword = async (UserId: string, password: string) => {
  const safeUserId = parseStrEmpty(UserId);
  if (!safeUserId) {
    throw new Error('Invalid UserId');
  }
  return request.put(`/system/user/resetPwd`, { userId: safeUserId, password });
};

export const changeUserStatus = async (UserId: string, status: string) => {
  const safeUserId = parseStrEmpty(UserId);
  if (!safeUserId) {
    throw new Error('Invalid UserId');
  }
  return request.put(`/system/user/changeStatus`, { userId: safeUserId, status });
};

export const exportUser = async (queryParams: any) => {
  return request.post('/system/user/export', queryParams);
};

export const getUserProfile = async () => {
  return request.get('/system/user/profile');
};

export const getUserAvatar = async (avatarPath: string) => {
  // avatarPath should be just the path/filename, not a full URL
  return request.get(`${avatarPath}`, { responseType: 'blob' });
}

export const updateUserProfile = async (data: any) => {
  return request.put('/system/user/profile', data);
};

export const updateUserAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatarfile', file);
  return request.post('/system/user/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const updateUserPassword = async (oldPassword: string, newPassword: string) => {
  return request.put(`/system/user/profile/updatePwd?oldPassword=${oldPassword}&newPassword=${newPassword}`);
};

export const getAuthRole = async () => {
  return request.get('/system/user/authRole');
};

export const updateAuthRole = async (data: any) => {
  return request.put('/system/user/authRole', data);
};

export const getUserPost = async () => {
  return request.get('/system/user/post');
};

export const deptTreeSelect = async () => {
  return request.get('/system/user/deptTree');
};





