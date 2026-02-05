import { getAuthRole, getUserPost, deptTreeSelect } from './user';

export const fetchRolesData = async () => {
  try {
    const response = await getAuthRole();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPostsData = async () => {
  try {
    const response = await getUserPost();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDepartmentTree = async () => {
  try {
    const response = await deptTreeSelect();
    return response.data;
  } catch (error) {
    throw error;
  }
}; 