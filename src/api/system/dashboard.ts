import request from "../../utils/request";

export interface RoleOverviewItem {
  roleName: string;
  count: number;
}

export interface ServerStatus {
  systemLoad: number;
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  uptimeMillis: number;
}

export interface ChartItem {
  label: string; // e.g., date string
  value: number;
}

export interface LogEntry {
  id: number;
  title: string | null;
  userName: string;
  ip: string;
  status: string; // "0" or "1"
  message: string | null;
  time: string; // ISO timestamp
}

export interface DashboardData {
  onlineUsers: number;
  totalUsers: number;
  totalRoles: number;
  totalDepts: number;
  totalPosts: number;
  unseenNotices: number;
  roleOverview: RoleOverviewItem[];
  serverStatus: ServerStatus;
  operationsChart: ChartItem[];
  totalLoginLogs: number;
  totalOperationLogs: number;
  recentOperationLogs: LogEntry[];
  recentLoginLogs: LogEntry[];
}

export interface DashboardResponse {
  msg: string;
  code: number; // 200 on success
  data: DashboardData;
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  return request.get('/system/dashboard');
};
