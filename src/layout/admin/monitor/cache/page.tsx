import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { getCache } from "../../../../api/monitor/cache";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  BarElement,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

type CommandStat = {
  name: string;
  value: string;
};

type RedisInfo = {
  [key: string]: string;
};

type CacheInfo = {
  commandStats: CommandStat[];
  info: RedisInfo;
  dbSize: number;
};

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, Title, BarElement);

// Utility to parse human-readable memory (e.g., "869.54K", "13.37M") to kilobytes
function parseMemoryToKB(memStr: string): number {
  if (!memStr) return 0;
  const match = memStr.match(/([\d.]+)\s*([KMG]?B?)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  switch (unit) {
    case "B":
      return value / 1000;
    case "K":
    case "KB":
      return value;
    case "M":
    case "MB":
      return value * 1000;
    case "G":
    case "GB":
      return value * 1000 * 1000;
    default:
      return value;
  }
}

const CacheMonitoringPage = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCacheInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCache();
        // If using axios, data is in res.data
        const data = res.data ? res.data : res;
        setCacheInfo(data);
      } catch (err: any) {
        setError("Failed to fetch cache info");
      } finally {
        setLoading(false);
      }
    };
    fetchCacheInfo();
  }, []);

  if (loading) {
    return <div className="p-4">Loading cache info...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!cacheInfo) {
    return <div className="p-4">No cache info available.</div>;
  }

  const { commandStats, info } = cacheInfo;

  const basicInfo = [
    { label: "Redis Version", value: info.redis_version },
    { label: "Operating Mode", value: info.redis_mode },
    { label: "Port", value: info.tcp_port },
    { label: "Connected Clients", value: info.connected_clients },
    { label: "Running Time (days)", value: info.uptime_in_days },
    { label: "Used Memory", value: info.used_memory_human },
    { label: "Used CPU (sys+user)", value: `${info.used_cpu_sys} + ${info.used_cpu_user}` },
    { label: "Max Memory Config", value: info.maxmemory_human },
    { label: "AOF Enabled", value: info.aof_enabled === "1" ? "Yes" : "No" },
    { label: "RDB Last Save Status", value: info.rdb_last_bgsave_status },
    { label: "Total Keys", value: info.db0?.match(/keys=(\d+)/)?.[1] || "0" },
    { label: "Network Input/Output", value: `${info.total_net_input_bytes} / ${info.total_net_output_bytes}` },
  ];

  const doughnutData = {
    labels: commandStats.map((cmd) => cmd.name),
    datasets: [
      {
        label: "Command Count",
        data: commandStats.map((cmd) => parseInt(cmd.value)),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#8BC34A",
        ],
      },
    ],
  };

  const usedMemoryKB = parseMemoryToKB(info.used_memory_human);
  const totalMemoryKB = 1000;
  const memoryPercentage = Math.min(Math.round((usedMemoryKB / totalMemoryKB) * 100), 100);

  const gaugeOption = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: totalMemoryKB,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.3, "#67e0e3"],
              [0.7, "#37a2da"],
              [1, "#fd666d"],
            ],
          },
        },
        pointer: {
          show: true,
        },
        title: {
          show: true,
          offsetCenter: [0, "60%"],
          fontSize: 14,
        },
        detail: {
          valueAnimation: true,
          formatter: `{value}K`,
          fontSize: 16,
          offsetCenter: [0, "80%"],
        },
        data: [
          {
            value: usedMemoryKB.toFixed(0),
            name: "Memory Usage",
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-semibold">Cache Monitoring</h2>

      {/* Basic Info */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {basicInfo.map((item) => (
            <div key={item.label} className="border p-2 rounded">
              <span className="font-semibold text-gray-700 block">{item.label}</span>
              <span className="text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Command Stats + Memory Gauge */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Command Statistics */}
        <div className="bg-white shadow rounded-lg p-4 w-full lg:w-1/2">
          <h3 className="text-lg font-medium mb-4">Command Statistics</h3>
          <div className="max-w-md mx-auto">
            <Doughnut data={doughnutData} />
          </div>
        </div>

        {/* Memory Usage Gauge */}
        <div className="bg-white shadow rounded-lg p-4 w-full lg:w-1/2">
          <h3 className="text-lg font-medium mb-4">Memory Usage</h3>
          <div className="mx-auto">
            <ReactECharts option={gaugeOption} style={{ height: 500, width: "100%" }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CacheMonitoringPage;
