import { useSelector } from 'react-redux';
import { selectUserPermissions } from '../features/user/userSlice';

/**
 * Hook to check if the user has a specific permission or any in a list.
 * @param perms Permission string or array of permission strings
 * @returns boolean
 */
export function usePermission(perms: string | string[]): boolean {
  const permissions = useSelector(selectUserPermissions);
  if (!permissions) return false;
  const permList = Array.isArray(perms) ? perms : [perms];
  return permissions.includes('*:*:*') || permList.some(p => permissions.includes(p));
}