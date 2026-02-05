import request from "../../utils/request";

export const getCache = async () => {
    return request.get(`/monitor/cache`);
};

export const listCacheName = async () => {
    return request.get(`/monitor/cache/getNames`);
};

export const listCacheKey = async (CacheName: string) => {
    return request.get(`/monitor/cache/getKeys/${CacheName}`);
};

export const getCacheValue = async (CacheName: string, CacheKey: string) => {
    return request.get(`/monitor/cache/getValue/${CacheName}/${CacheKey}`);
};

// Clear cache of specified name
export const clearCacheName = async (CacheName: string) => {
    return request.delete(`/monitor/cache/clearCacheName/${CacheName}`);
};

export const clearCacheKey = async (CacheKey: string) => {
    return request.delete(`/monitor/cache/clearCacheKey/${CacheKey}`);
};

export const clearCacheAll = async () => {
    return request.delete(`/monitor/cache/clearCacheAll`);
};