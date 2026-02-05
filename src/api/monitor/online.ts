import request from "../../utils/request";

interface listParams {
  ipaddr?: string;
  userName?: string;
}

export const list = async (params?: listParams) => {
  const queryParams = new URLSearchParams();

  if (params?.ipaddr) {
    queryParams.append('ipaddr', params.ipaddr.toString());
  }

  if (params?.userName) {
    queryParams.append('userName', params.userName.toString());
  }

  const queryString = queryParams.toString();
  const url = `/monitor/online/list${queryString ? `?${queryString}` : ''}`;

  return request.get(url);
};

export const forceLogout = async (tokenId: string) => {
  return request.delete(`/monitor/online/${tokenId}`);
};