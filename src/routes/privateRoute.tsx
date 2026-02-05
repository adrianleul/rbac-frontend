import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

interface Props {
  roles?: string[]
  permissions?: string[]
  userRoles: string[]
  userPermissions: string[]
}

const hasAccess = (
  routeRoles: string[] | undefined,
  routePerms: string[] | undefined,
  userRoles: string[],
  userPermissions: string[]
) => {
  // Super admin: grant access to all routes
  if (userPermissions.includes('*:*:*')) return true;
  if (routeRoles && !routeRoles.some(r => userRoles.includes(r))) return false
  if (routePerms && !routePerms.some(p => userPermissions.includes(p))) return false
  return true
}

const PrivateRoute: React.FC<Props> = ({
  roles,
  permissions,
  userRoles,
  userPermissions
}) => {
  return hasAccess(roles, permissions, userRoles, userPermissions)
    ? <Outlet />
    : <Navigate to="/401" replace />
}

export default PrivateRoute
