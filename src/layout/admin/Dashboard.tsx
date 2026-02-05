import { useEffect, useMemo, useState } from "react";
import { getDashboard, DashboardData } from "../../api/system/dashboard";
import {
  Users,
  UserRound,
  Shield,
  Building2,
  Briefcase,
  Bell,
  FileClock,
  Cpu,
  MemoryStick,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${sizes[i]}`;
};

const formatDateTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    return iso;
  }
};

const StatusBadge: React.FC<{ label: string | number; tone?: "green" | "red" | "gray" | "blue" | "amber" }> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    green: "bg-green-100 text-green-700 ring-green-200",
    red: "bg-red-100 text-red-700 ring-red-200",
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
    blue: "bg-blue-100 text-blue-700 ring-blue-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>{label}</span>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const memory = useMemo(() => {
    if (!data) return { total: 0, free: 0, used: 0, usedPct: 0 };
    const total = data.serverStatus.totalMemory || 0;
    const free = data.serverStatus.freeMemory || 0;
    const used = data.serverStatus.usedMemory || Math.max(total - free, 0);
    const usedPct = total > 0 ? Math.round((used / total) * 100) : 0;
    return { total, free, used, usedPct };
  }, [data]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDashboard();
        if (mounted) setData(res.data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-28 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white/70 backdrop-blur border shadow-sm p-4 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-6 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="h-64 rounded-xl bg-white/70 backdrop-blur border shadow-sm animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-gray-600">No data available.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border shadow-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
              <p className="mt-1 text-white/80">Overview of system activity and server health</p>
            </div>
            <div className="text-sm md:text-base text-white/90">
              Last updated
              <span className="ml-2 rounded-full bg-white/20 px-3 py-1">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-20 blur-0">
          <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M48.6,-55.7C63.3,-48.8,75.1,-32.6,77.7,-15.5C80.3,1.5,73.6,19.3,63.7,34.3C53.8,49.3,40.7,61.4,24.8,68.1C9,74.8,-9.6,76.1,-27.2,70.6C-44.7,65.1,-61.2,52.8,-69.3,37.1C-77.5,21.4,-77.3,2.3,-72.9,-14.2C-68.6,-30.7,-60.2,-44.6,-48.5,-52.6C-36.8,-60.5,-22,-62.6,-7.5,-61.2C7,-59.9,14,-55.5,48.6,-55.7Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Online Users", value: data.onlineUsers, icon: Users, tone: "indigo" },
          { label: "Users", value: data.totalUsers, icon: UserRound, tone: "blue" },
          { label: "Roles", value: data.totalRoles, icon: Shield, tone: "violet" },
          { label: "Departments", value: data.totalDepts, icon: Building2, tone: "fuchsia" },
          { label: "Positions", value: data.totalPosts, icon: Briefcase, tone: "emerald" },
          { label: "Notices", value: data.unseenNotices, icon: Bell, tone: "amber" },
          { label: "Login Logs", value: data.totalLoginLogs, icon: FileClock, tone: "rose" },
          { label: "Operation Logs", value: data.totalOperationLogs, icon: FileClock, tone: "emerald" },
        ].map((m) => (
          <div
            key={m.label}
            className="group rounded-xl border bg-white shadow-sm p-4 transition hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,1) 0%, rgba(5,150,105,1) 50%, rgba(22,163,74,1) 100%)",
                }}
              >
                {m.icon && <m.icon className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500">{m.label}</div>
                <div className="text-2xl font-semibold tracking-tight text-gray-900">{m.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Overview */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <div className="text-lg font-semibold">Role Overview</div>
          </div>
        </div>
        <div className="p-4">
          {data.roleOverview?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.roleOverview.map((r) => (
                <div key={r.roleName} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium text-gray-800 truncate">{r.roleName}</span>
                  <StatusBadge label={r.count} tone="blue" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No role data</div>
          )}
        </div>
      </div>

      {/* Server Status */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-teal-600" />
            <div className="text-lg font-semibold">Server Status</div>
          </div>
        </div>
        <div className="p-4 space-y-4 text-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="flex justify-between"><span>System Load</span><span className="font-medium">{data.serverStatus.systemLoad}</span></div>
            <div className="flex justify-between"><span>Total Memory</span><span className="font-medium">{formatBytes(memory.total)}</span></div>
            <div className="flex justify-between"><span>Free Memory</span><span className="font-medium">{formatBytes(memory.free)}</span></div>
            <div className="flex justify-between"><span>Used Memory</span><span className="font-medium">{formatBytes(memory.used)}</span></div>
            <div className="flex justify-between"><span>Uptime (ms)</span><span className="font-medium">{data.serverStatus.uptimeMillis}</span></div>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
              <MemoryStick className="h-4 w-4 text-emerald-600" />
              <span>Memory Usage</span>
              <StatusBadge label={`${memory.usedPct}%`} tone={memory.usedPct > 80 ? "red" : memory.usedPct > 60 ? "amber" : "green"} />
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${memory.usedPct > 80 ? "bg-red-500" : memory.usedPct > 60 ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${memory.usedPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operations Chart */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <FileClock className="h-5 w-5 text-green-600" />
            <div className="text-lg font-semibold">Operations</div>
          </div>
        </div>
        <div className="p-4">
          {data.operationsChart?.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={data.operationsChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </RBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-500">No chart data</div>
          )}
        </div>
      </div>

      {/* Recent Operation Logs */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Recent Operation Logs</div>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr className="border-b bg-gray-50">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">IP</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Message</th>
                <th className="py-2 pr-4">Time</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {data.recentOperationLogs?.map((log, idx) => (
                <tr key={log.id} className={idx % 2 === 0 ? "border-b" : "border-b bg-gray-50/50"}>
                  <td className="py-2 pr-4">{log.id}</td>
                  <td className="py-2 pr-4">{log.title ?? "-"}</td>
                  <td className="py-2 pr-4">{log.userName}</td>
                  <td className="py-2 pr-4">{log.ip}</td>
                  <td className="py-2 pr-4">
                    {(() => {
                      const isSuccess = Number(log.status) === 0;
                      const isFailure = Number(log.status) === 1;
                      const label = isSuccess ? "Success" : isFailure ? "Failure" : String(log.status);
                      const tone = isSuccess ? "green" : isFailure ? "red" : "gray";
                      return <StatusBadge label={label} tone={tone} />;
                    })()}
                  </td>
                  <td className="py-2 pr-4">{log.message ?? "-"}</td>
                  <td className="py-2 pr-4">{formatDateTime(log.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Login Logs */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Recent Login Logs</div>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr className="border-b bg-gray-50">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">IP</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Message</th>
                <th className="py-2 pr-4">Time</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {data.recentLoginLogs?.map((log, idx) => (
                <tr key={log.id} className={idx % 2 === 0 ? "border-b" : "border-b bg-gray-50/50"}>
                  <td className="py-2 pr-4">{log.id}</td>
                  <td className="py-2 pr-4">{log.userName}</td>
                  <td className="py-2 pr-4">{log.ip}</td>
                  <td className="py-2 pr-4">
                    {(() => {
                      const isSuccess = Number(log.status) === 0;
                      const isFailure = Number(log.status) === 1;
                      const label = isSuccess ? "Success" : isFailure ? "Failure" : String(log.status);
                      const tone = isSuccess ? "green" : isFailure ? "red" : "gray";
                      return <StatusBadge label={label} tone={tone} />;
                    })()}
                  </td>
                  <td className="py-2 pr-4">{log.message ?? "-"}</td>
                  <td className="py-2 pr-4">{formatDateTime(log.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
