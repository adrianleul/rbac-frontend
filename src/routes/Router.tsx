import { useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { constantRoutes } from './constantRoutes';
import { dynamicRoutes } from './dynamicRoutes';
import PrivateRoute from './privateRoute';
import { selectUserRoles, selectUserPermissions } from '../features/user/userSlice';
import type { AppRoute } from '../types/types';

const wrapWithPrivateRoute = (
  route: AppRoute,
  roles: string[],
  permissions: string[]
): AppRoute => {
  let children = route.children;
  // Recursively wrap children
  if (children) {
    children = children.map((child: AppRoute) => wrapWithPrivateRoute(child, roles, permissions));
  }
  if (route.roles || route.permissions) {
    // Move the original element to a child route
    const protectedRoute: AppRoute = {
      ...route,
      element: (
        <PrivateRoute
          roles={route.roles}
          permissions={route.permissions}
          userRoles={roles}
          userPermissions={permissions}
        />
      ),
      children: [
        {
          path: '',
          element: route.element,
          children: children,
        },
      ],
    };
    // No need to delete children from element, just return
    return protectedRoute;
  }
  return { ...route, children };
};

const AppRouter = () => {
  const roles = useSelector(selectUserRoles);
  const permissions = useSelector(selectUserPermissions);

  const renderRoutes = [
    ...constantRoutes,
    ...dynamicRoutes.map((route) => wrapWithPrivateRoute(route, roles, permissions)),
  ];

  const routing = useRoutes(renderRoutes);
  return routing;
};

export default AppRouter;