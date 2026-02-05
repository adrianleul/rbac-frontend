export interface RouteMeta {
  title?: string
  icon?: string
  breadcrumb?: boolean
  activeMenu?: string
  noCache?: boolean
  link?: string | null;
}

export interface AppRoute {
  path: string
  element?: React.ReactNode
  children?: AppRoute[]
  name?: string
  hidden?: boolean
  redirect?: string
  roles?: string[]
  permissions?: string[]
  component?: string
  alwaysShow?: boolean
  meta?: RouteMeta
}  