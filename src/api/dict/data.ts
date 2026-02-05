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

export const listData = async (params?: ListParams) => {
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
  const url = `/system/dict/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

// Query dictionary data details
export const getData = async (DictCode: string) => {
  return request.get(`/system/dict/data/${DictCode}`);
};

// Query dictionary data information based on dictionary type
export const getDicts = async (DictType: string) => {
  return request.get(`/system/dict/data/type/${DictType}`);
};

interface AddResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const addData = async (data: any): Promise<AddResponse> => {
  return request.post('/system/dict/data', data);
};

export const updateData = async (data: any) => {
  return request.put('/system/dict/data', data);
};

export const delData = async (DictCode: string) => {
  return request.delete(`/system/config/${DictCode}`);
}