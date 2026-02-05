import request from "../../utils/request";

interface listParams {
  pageNum?: number;
  pageSize?: number;
  ipaddr?: string;
  userName?: string;
  status?: string;
  beginTime?: string;
  endTime?: string;
}

export const list = async (params?: listParams) => {
  const queryParams = new URLSearchParams();

  if (params?.pageNum) {
    queryParams.append('pageNum', params.pageNum.toString());
  }

  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }

  if (params?.ipaddr) {
    queryParams.append('ipaddr', params.ipaddr);
  }

  if (params?.userName) {
    queryParams.append('userName', params.userName);
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
  const url = `/monitor/logininfor/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

export const exportLogininfor = async (queryParams: any) => {
  return request.post('/monitor/logininfor/export', queryParams);
};

export const delLogininfor = async (infoIds: string | number | (string | number)[]) => {
  let safeInfoIds: string;
  if (Array.isArray(infoIds)) {
    safeInfoIds = infoIds.map(id => String(id)).filter(Boolean).join(',');
  } else {
    safeInfoIds = String(infoIds);
  }
  if (!safeInfoIds) {
    throw new Error('Invalid Login Log ID(s)');
  }
  return request.delete(`/monitor/logininfor/${safeInfoIds}`);
};

export const unlockLogininfor = async (userName: string) => {
  return request.get(`/monitor/logininfor/${userName}`);
};

export const cleanLogininfor = async () => {
  return request.get(`/monitor/logininfor`);
};