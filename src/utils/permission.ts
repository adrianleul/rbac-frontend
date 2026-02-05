import { useSelector } from 'react-redux';
import { selectUserRoles, selectUserPermissions } from '../features/user/userSlice';

/**
 * Character permission verification
 * @param {string[]} value Array of permission strings to check
 * @returns {boolean} True if the user has the required permissions, false otherwise
 */
export function checkPermi(value: string[]): boolean {
  if (value && value instanceof Array && value.length > 0) {
    // Get the permissions from the Redux store
    const permissions = useSelector(selectUserPermissions);
    const permissionDatas = value;
    const all_permission = "*:*:*";

    // Check if any permission matches the required ones
    const hasPermission = permissions.some((permission) => {
      return all_permission === permission || permissionDatas.includes(permission);
    });

    return hasPermission;
  } else {
    console.error(`need permissions! Like checkPermi="['system:user:add','system:user:edit']"`);
    return false;
  }
}

/**
 * Role permission verification
 * @param {string[]} value Array of roles to check
 * @returns {boolean} True if the user has the required roles, false otherwise
 */
export function checkRole(value: string[]): boolean {
  if (value && value instanceof Array && value.length > 0) {
    // Get the roles from the Redux store
    const roles = useSelector(selectUserRoles);
    const permissionRoles = value;
    const super_admin = "admin";

    // Check if any role matches the required ones
    const hasRole = roles.some((role) => {
      return super_admin === role || permissionRoles.includes(role);
    });

    return hasRole;
  } else {
    console.error(`need roles! Like checkRole="['admin','editor']"`);
    return false;
  }
}
