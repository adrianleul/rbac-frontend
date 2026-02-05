import request from "../../utils/request";

interface listParams {
  pageNum?: number;
  pageSize?: number;
  operIp?: string;
  title?: string;
  operName?: string;
  businessType?: string;
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

  if (params?.operIp) {
    queryParams.append('operIp', params.operIp.toString());
  }

  if (params?.title) {
    queryParams.append('title', params.title.toString());
  }

  if (params?.operName) {
    queryParams.append('operName', params.operName.toString());
  }

  if (params?.businessType) {
    queryParams.append('businessType', params.businessType);
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
  const url = `/monitor/operlog/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

export const exportOperlog = async (queryParams: any) => {
  return request.post('/monitor/operlog/export', queryParams);
};

export const delOperlog = async (operIds: string | number | (string | number)[]) => {
  let safeOperIds: string;
  if (Array.isArray(operIds)) {
    safeOperIds = operIds.map(id => String(id)).filter(Boolean).join(',');
  } else {
    safeOperIds = String(operIds);
  }
  if (!safeOperIds) {
    throw new Error('Invalid Operation Log ID(s)');
  }
  return request.delete(`/monitor/operlog/${safeOperIds}`);
};

export const cleanOperlog = async () => {
  return request.delete(`/monitor/operlog/clean`);
};