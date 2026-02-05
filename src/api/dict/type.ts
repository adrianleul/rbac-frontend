import request from "../../utils/request";

interface ListParams {
  pageNum?: number;
  pageSize?: number;
  dictName?: string;
  dictType?: string;
  status?: string;
  beginTime?: string;
  endTime?: string;
}

export const listType = async (params?: ListParams) => {
  const queryParams = new URLSearchParams();

  if (params?.pageNum) {
    queryParams.append('pageNum', params.pageNum.toString());
  }

  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }

  if (params?.dictName) {
    queryParams.append('dictName', params.dictName);
  }

  if (params?.dictType) {
    queryParams.append('dictType', params.dictType);
  }

  if (params?.status) {
    queryParams.append('status', params.status);
  }

  if (params?.beginTime) {
    queryParams.append('params[beginTime]', params.beginTime);
  }

  if (params?.endTime) {
    queryParams.append('params[endTime]', params.endTime);
  }

  const queryString = queryParams.toString();
  const url = `/system/dict/type/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

// Query dictionary type details
export const getType = async (DictId: string) => {
  return request.get(`/system/dict/type/${DictId}`);
};

interface AddResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const addType = async (data: any): Promise<AddResponse> => {
  return request.post('/system/dict/type', data);
};

export const updateType = async (data: any) => {
  return request.put('/system/dict/type', data);
};

export const delType = async (DictId: string) => {
  return request.delete(`/system/dict/type/${DictId}`);
}

// Flush dictionary cache
export const refreshCache = async () => {
  return request.delete(`/system/dict/type/refreshCache`);
}

// Get dictionary select box list
export const optionselect = async () => {
  return request.get('system/dict/type/optionselect')
}

export const exportDictType = async (queryParams: any) => {
  return request.post('/system/dict/type/export', queryParams);
};