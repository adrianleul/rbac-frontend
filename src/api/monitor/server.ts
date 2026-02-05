import request from "../../utils/request";

export const getServer = async () => {
    return request.get('/monitor/server');
}