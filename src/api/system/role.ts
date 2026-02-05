import request from "../../utils/request";
import { parseStrEmpty } from "../../utils/config";

interface ListRoleParams {
    pageNum?: number;
    pageSize?: number;
    roleName?: string;
    roleKey?: string;
    status?: string;
    beginTime?: string;
    endTime?: string;
}

// Quer role list
export const listRole = async (params?: ListRoleParams) => {
    const queryParams = new URLSearchParams();

    if (params?.pageNum) {
        queryParams.append('pageNum', params.pageNum.toString());
    }

    if (params?.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
    }

    if (params?.roleName) {
        queryParams.append('roleName', params.roleName);
    }

    if (params?.roleKey) {
        queryParams.append('roleKey', params.roleKey);
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
    const url = `/system/role/list${queryString ? `?${queryString}` : ''}`;

    return request.get(url);
};

// Query role details
export const getRole = async (RoleId: string) => {
    const safeRoleId = parseStrEmpty(RoleId);
    if (!safeRoleId) {
        throw new Error('Invalid RoleId');
    }
    return request.get(`/system/role/${safeRoleId}`);
}

// Add new role
interface AddRoleResponse {
    code: number;
    msg?: string;
    data?: any;
}

export const addRole = async (data: any): Promise<AddRoleResponse> => {
    return request.post('/system/role', data);
};

export const updateRole = async (data: any): Promise<AddRoleResponse> => {
    return request.put('/system/role', data);
};

// Role data permissions
export const dataScope = async (data: any) => {
    return request.put('/system/role/dataScope', data);
}

export const changeRoleStatus = async (RoleId: string, status: string) => {
    const safeRoleId = parseStrEmpty(RoleId);
    if (!safeRoleId) {
        throw new Error('Invalid Role ID');
    }
    return request.put(`/system/role/changeStatus`, { roleId: safeRoleId, status });
};

export const deleteRole = async (roleIds: string | string[]) => {
    let safeRoleIds: string;

    if (Array.isArray(roleIds)) {
        // For bulk deletion, join with commas
        safeRoleIds = roleIds.map(id => parseStrEmpty(id)).filter(Boolean).join(',');
    } else {
        // For single role deletion
        safeRoleIds = parseStrEmpty(roleIds);
    }

    if (!safeRoleIds) {
        throw new Error('Invalid role Ids(s)');
    }

    return request.delete(`/system/role/${safeRoleIds}`);
};

interface ListRoleUsersParams {
    pageNum?: number;
    pageSize?: number;
    roleId?: number;
    userName?: string;
    phonenumber?: string;
}

// Query the list of users authorized by the role
export const allocatedUserList = async (RoleId: string, params?: ListRoleUsersParams) => {
    const safeRoleId = parseStrEmpty(RoleId);
    if (!safeRoleId) {
        throw new Error('Invalid RoleId');
    }
    const queryParams = new URLSearchParams();

    if (params?.pageNum) {
        queryParams.append('pageNum', params.pageNum.toString());
    }

    if (params?.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
    }

    if (safeRoleId) {
        queryParams.append('roleId', safeRoleId.toString());
    }

    if (params?.userName) {
        queryParams.append('userName', params.userName);
    }

    if (params?.phonenumber) {
        queryParams.append('phonenumber', params.phonenumber);
    }

    const queryString = queryParams.toString();
    const url = `/system/role/authUser/allocatedList${queryString ? `?${queryString}` : ''}`;

    return request.get(url);
};

// Query the list of users whose role is not authorized
export const unallocatedUserList = async (RoleId: string, params?: ListRoleUsersParams) => {
    const safeRoleId = parseStrEmpty(RoleId);
    if (!safeRoleId) {
        throw new Error('Invalid RoleId');
    }
    const queryParams = new URLSearchParams();

    if (params?.pageNum) {
        queryParams.append('pageNum', params.pageNum.toString());
    }

    if (params?.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
    }

    if (safeRoleId) {
        queryParams.append('roleId', safeRoleId.toString());
    }

    if (params?.userName) {
        queryParams.append('userName', params.userName);
    }

    if (params?.phonenumber) {
        queryParams.append('phonenumber', params.phonenumber);
    }

    const queryString = queryParams.toString();
    const url = `/system/role/authUser/unallocatedList${queryString ? `?${queryString}` : ''}`;

    return request.get(url);
};

// Cancel user authorization role
export const authUserCancel = async (data: any) => {
    return request.put('/system/role/authUser/cancel', data);
}

// Cancel user authorization roles in batches
export const authUserCancelAll = async (roleId: string, userIds: string | string[]) => {
    const safeRoleId = parseStrEmpty(roleId);
    if (!safeRoleId) {
        throw new Error('Invalid RoleId');
    }

    let safeUserIds: string;

    if (Array.isArray(userIds)) {
        safeUserIds = userIds.map(id => parseStrEmpty(id)).filter(Boolean).join(',');
    } else {
        safeUserIds = parseStrEmpty(userIds);
    }

    if (!safeUserIds) {
        throw new Error('Invalid user Ids(s)');
    }
    const url = `/system/role/authUser/cancelAll?roleId=${safeRoleId}&userIds=${safeUserIds}`;
    return request.put(url);
}

// Authorized user selection
export const authUserSelectAll = async (roleId: string, userIds: string | string[]) => {
    const safeRoleId = parseStrEmpty(roleId);

    if (!safeRoleId) {
        throw new Error('Invalid RoleId');
    }
    let safeUserIds: string;

    if (Array.isArray(userIds)) {
        safeUserIds = userIds.map(id => parseStrEmpty(id)).filter(Boolean).join(',');
    } else {
        safeUserIds = parseStrEmpty(userIds);
    }

    if (!safeUserIds) {
        throw new Error('Invalid user Ids(s)');
    }
    const url = `/system/role/authUser/selectAll?roleId=${safeRoleId}&userIds=${safeUserIds}`;
    return request.put(url);
}

// Query department tree structure based on role ID
export const deptTreeSelect = async (RoleId: string) => {
    const safeRoleId = parseStrEmpty(RoleId);
    if (!safeRoleId) {
        throw new Error('Invalid RoleId');
    }
    return request.get(`/system/role/deptTree/${safeRoleId}`);
}

export const exportRole = async (queryParams: any) => {
    return request.post('/system/role/export', queryParams);
};