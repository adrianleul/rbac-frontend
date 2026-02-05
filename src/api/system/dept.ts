import request from "../../utils/request";
import { parseStrEmpty } from "../../utils/config";

interface ListParams {
  deptName?: string;
  status?: string;
}

export const listDept = async (params?: ListParams) => {
  const queryParams = new URLSearchParams();

  if (params?.deptName) {
    queryParams.append('deptName', params.deptName);
  }

  if (params?.status) {
    queryParams.append('status', params.status);
  }

  const queryString = queryParams.toString();
  const url = `/system/dept/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

// Query department list (exclude nodes)
export const listDeptExcludeChild = async (DeptId: string) => {
  const safeId = parseStrEmpty(DeptId);
  if (!safeId) {
    throw new Error('Invalid DeptId');
  }
  return request.get(`/system/dept/exclude/${safeId}`);
};


export const getDept = async (DeptId: string) => {
  const safeId = parseStrEmpty(DeptId);
  if (!safeId) {
    throw new Error('Invalid DeptId');
  }
  return request.get(`/system/dept/${safeId}`);
};

interface AddResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const addDept = async (data: any): Promise<AddResponse> => {
  return request.post('/system/dept', data);
};

export const updateDept = async (data: any) => {
  return request.put('/system/dept', data);
};

export const delDept = async (DeptId: string) => {
  const safeId = parseStrEmpty(DeptId);
  if (!safeId) {
    throw new Error('Invalid DeptId');
  }
  return request.delete(`/system/dept/${safeId}`);
}