import request from "../../utils/request";

export const getRouters = async () => {
  return request.get('/auth/getRouters');
};