import type { AppRoute } from '../types/types'
import Layout from '../layout/Layout'

import UserPage from '../layout/admin/system/user/page'
import RolesPage from '../layout/admin/system/role/page'
import MenuPage from '../layout/admin/system/menu/page'
import DictionaryPage from '../layout/admin/system/dict/page'
import ConfigurationPage from '../layout/admin/system/config/page'
import NoticeManagementPage from '../layout/admin/system/notification/page'
import PositionPage from '../layout/admin/system/position/page'
import DepartementPage from '../layout/admin/system/dept/page'
import OnlineUsersPage from '../layout/admin/monitor/online/page'
import ServerPage from '../layout/admin/monitor/server/page'
import OperationLog from '../layout/admin/monitor/log/page'
import LoginLog from '../layout/admin/monitor/log/login/page'
import CacheMonitoringPage from '../layout/admin/monitor/cache/page'
import CacheListPage from '../layout/admin/monitor/cache/list/page'
import AdminDashboard from '../layout/admin/Dashboard'

export const dynamicRoutes: AppRoute[] = [
  {
    path: '/admin',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <AdminDashboard />,
        name: 'Index',
        meta: { title: 'Home', icon: 'dashboard' }
      },
      {
        path: 'system',
        children: [
          { path: 'user', element: <UserPage />, name: 'Index', permissions: ['system:user:list'] },
          { path: 'role', element: <RolesPage />, name: 'Index', permissions: ['system:role:list'] },
          { path: 'menu', element: <MenuPage />, name: 'Index' },
          { path: 'dict', element: <DictionaryPage />, name: 'Index' },
          { path: 'config', element: <ConfigurationPage />, name: 'Index' },
          { path: 'notification', element: <NoticeManagementPage />, name: 'Index' },
          { path: 'position', element: <PositionPage />, name: 'Index' },
          { path: 'dept', element: <DepartementPage />, name: 'Index' },
        ]
      },
      {
        path: 'monitor',
        children: [
          { path: 'online', element: <OnlineUsersPage />, name: 'Index' },
          { path: 'server', element: <ServerPage />, name: 'Index' },
          { path: 'log', element: <OperationLog />, name: 'Index' },
          { path: 'log/login', element: <LoginLog />, name: 'Index' },
          { path: 'cache', element: <CacheMonitoringPage />, name: 'Index' },
          { path: 'cache/list', element: <CacheListPage />, name: 'Index' },
        ]
      },
    ]
  },

]
