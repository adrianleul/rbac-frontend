import request from "../../utils/request";
import { parseStrEmpty } from "../../utils/config";

interface listNoticeParams {
  pageNum?: number;
  pageSize?: number;
  noticeTitle?: string;
  createBy?: string;
  noticeType?: string;
}

export const listNotice = async (params?: listNoticeParams) => {
  const queryParams = new URLSearchParams();

  if (params?.pageNum) {
    queryParams.append('pageNum', params.pageNum.toString());
  }

  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }

  if (params?.noticeTitle) {
    queryParams.append('noticeTitle', params.noticeTitle);
  }

  if (params?.createBy) {
    queryParams.append('createBy', params.createBy);
  }

  if (params?.noticeType) {
    queryParams.append('noticeType', params.noticeType);
  }

  const queryString = queryParams.toString();
  const url = `/system/notice/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

export const listUserNotice = async (params?: listNoticeParams) => {
  const queryParams = new URLSearchParams();

  if (params?.pageNum) {
    queryParams.append('pageNum', params.pageNum.toString());
  }

  if (params?.pageSize) {
    queryParams.append('pageSize', params.pageSize.toString());
  }

  if (params?.noticeType) {
    queryParams.append('noticeType', params.noticeType);
  }

  const queryString = queryParams.toString();
  const url = `/system/notice/getUserNotice${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

export const markSeen = async (noticeId: string) => {
  return request.post('/system/notice/mark-seen', { noticeId });
}

export const exportNotice = async (queryParams: any) => {
  return request.post('/system/notice/export', queryParams);
};

export const getNotice = async (NoticeId: string) => {
  const safeNoticeId = parseStrEmpty(NoticeId);
  if (!safeNoticeId) {
    throw new Error('Invalid NoticeId');
  }
  return request.get(`/system/notice/${safeNoticeId}`);
};

interface AddNoticeResponse {
  code: number;
  msg?: string;
  data?: any;
}

export const addNotice = async (data: any): Promise<AddNoticeResponse> => {
  return request.post('/system/notice', data);
};

export const updateNotice = async (data: any) => {
  return request.put('/system/notice', data);
};


export const deleteNotice = async (noticeIds: string | string[]) => {
  let safeNoticeIds: string;

  if (Array.isArray(noticeIds)) {
    // For bulk deletion, join with commas
    safeNoticeIds = noticeIds.map(id => parseStrEmpty(id)).filter(Boolean).join(',');
  } else {
    // For single notice deletion
    safeNoticeIds = parseStrEmpty(noticeIds);
  }

  if (!safeNoticeIds) {
    throw new Error('Invalid NoticeId(s)');
  }

  return request.delete(`/system/notice/${safeNoticeIds}`);
};

export const getUnseenNoticeCount = async () => {
  const response = await listUserNotice({ pageNum: 1, pageSize: 1000 });
  let notices: any[] = [];
  if (Array.isArray(response)) {
    notices = response;
  } else if (response && typeof response === 'object') {
    const data = response as any;
    let rawData: any[] = [];
    if (Array.isArray(data.rows)) rawData = data.rows;
    else if (Array.isArray(data.list)) rawData = data.list;
    else if (Array.isArray(data.records)) rawData = data.records;
    else if (Array.isArray(data.data)) rawData = data.data;
    notices = rawData;
  }
  return notices.filter(n => !n.seen).length;
}