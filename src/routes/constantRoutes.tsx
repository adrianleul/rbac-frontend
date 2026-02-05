import type{ AppRoute } from '../types/types'
import LoginPage from '../layout/Login'
import NotFound from '../views/NotFound'
import Unauthorized from '../views/Unauthorized'

export const constantRoutes: AppRoute[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '/401',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]
