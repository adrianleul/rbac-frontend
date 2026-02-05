import request from "../../utils/request";
import { parseStrEmpty } from "../../utils/config";

interface ListMenuParams {
  menuName?: string;
  status?: string;
}

export const listMenu = async (params?: ListMenuParams) => {
  const queryParams = new URLSearchParams();

  if (params?.menuName) {
    queryParams.append('menuName', params.menuName);
  }

  if (params?.status) {
    queryParams.append('status', params.status);
  }

  const queryString = queryParams.toString();
  const url = `/system/menu/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

// Query menu details
export const getMenu = async (MenuId: string) => {
  const safeMenuId = parseStrEmpty(MenuId);
  if (!safeMenuId) {
    throw new Error('Invalid MenuId');
  }
  return request.get(`/system/menu/${safeMenuId}`);
};

// Query menu drop-down tree structure
export const treeselect = async () => {
  return request.get('/system/menu/treeselect');
};

// Query menu drop-down tree structure based on role ID
export interface RoleMenuTreeselectResponse {
  msg: string;
  code: number;
  checkedKeys: number[];
}
export const roleMenuTreeselect = async (RoleId: string): Promise<RoleMenuTreeselectResponse> => {
  const safeRoleId = parseStrEmpty(RoleId);
  if (!safeRoleId) {
    throw new Error('Invalid RoleId');
  }
  return request.get(`/system/menu/roleMenuTreeselect/${safeRoleId}`);
};

interface AddMenuResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const addMenu = async (data: any): Promise<AddMenuResponse> => {
  return request.post('/system/menu', data);
};

export const updateMenu = async (data: any) => {
  return request.put('/system/menu', data);
};

export const deleteMenu = async (MenuIds: string | string[]) => {
  let safeMenuIds: string;

  if (Array.isArray(MenuIds)) {
    // For bulk deletion, join with commas
    safeMenuIds = MenuIds.map(id => parseStrEmpty(id)).filter(Boolean).join(',');
  } else {
    // For single menu deletion
    safeMenuIds = parseStrEmpty(MenuIds);
  }

  if (!safeMenuIds) {
    throw new Error('Invalid MenuIds(s)');
  }

  return request.delete(`/system/menu/${safeMenuIds}`);
};