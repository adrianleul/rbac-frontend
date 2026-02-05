import request from "../../utils/request";
import { parseStrEmpty } from "../../utils/config";

interface ListParams {
  pageNum?: number;
  pageSize?: number;
  configName?: string;
  configKey?: string;
  configType?: string;
  beginTime?: string;
  endTime?: string;
}

export const listConfig = async (params?: ListParams) => {
  const queryParams = new URLSearchParams();

  if (params?.pageNum) {
    queryParams.append('pageNum', params.pageNum.toString());
  }

  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }

  if (params?.configName) {
    queryParams.append('configName', params.configName);
  }

  if (params?.configKey) {
    queryParams.append('configKey', params.configKey);
  }

  if (params?.configType) {
    queryParams.append('configType', params.configType);
  }

  if (params?.beginTime) {
    queryParams.append('params[beginTime]', params.beginTime);
  }

  if (params?.endTime) {
    queryParams.append('params[endTime]', params.endTime);
  }

  const queryString = queryParams.toString();
  const url = `/system/config/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

export const getConfig = async (ConfigId: string) => {
  const safeId = parseStrEmpty(ConfigId);
  if (!safeId) {
    throw new Error('Invalid ConfigId');
  }
  return request.get(`/system/config/${safeId}`);
};

// Query parameter value based on parameter key name
export const getConfigKey = async (configKey: string) => {
  return request.get(`/system/config/${configKey}`);
}

interface AddResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const addConfig = async (data: any): Promise<AddResponse> => {
  return request.post('/system/config', data);
};

export const updateConfig = async (data: any) => {
  return request.put('/system/config', data);
};

export const delConfig = async (ConfigId: string) => {
  const safeId = parseStrEmpty(ConfigId);
  if (!safeId) {
    throw new Error('Invalid ConfigId');
  }
  return request.delete(`/system/config/${safeId}`);
}

// Refresh parameter cache
export const refreshCache = async () => {
  return request.delete('/system/config/refreshCache');
}

export const exportConfig = async (queryParams: any) => {
  return request.post('/system/config/export', queryParams);
};