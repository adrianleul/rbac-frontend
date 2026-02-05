import request from "../../utils/request";
import { parseStrEmpty } from "../../utils/config";

interface ListParams {
  postCode?: string;
  postName?: string;
  status?: string;
}

export const listPost = async (params?: ListParams) => {
  const queryParams = new URLSearchParams();

  if (params?.postCode) {
    queryParams.append('postCode', params.postCode);
  }

  if (params?.postName) {
    queryParams.append('postName', params.postName);
  }

  if (params?.status) {
    queryParams.append('status', params.status);
  }

  const queryString = queryParams.toString();
  const url = `/system/post/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

export const exportPost = async (queryParams: any) => {
  return request.post('/system/post/export', queryParams);
};

export const getPost = async (PostId: string) => {
  const safeId = parseStrEmpty(PostId);
  if (!safeId) {
    throw new Error('Invalid PostId');
  }
  return request.get(`/system/post/${safeId}`);
};

interface AddResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const addPost = async (data: any): Promise<AddResponse> => {
  return request.post('/system/post', data);
};

interface UpdateResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const updatePost = async (data: any): Promise<UpdateResponse> => {
  return request.put('/system/post', data);
};

export const delPost = async (PostId: string) => {
  const safeId = parseStrEmpty(PostId);
  if (!safeId) {
    throw new Error('Invalid PostId');
  }
  return request.delete(`/system/post/${safeId}`);
}