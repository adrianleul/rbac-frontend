import { Progress } from "../../../../components/Progress";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  ServerCog,
  Laptop2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getServer } from "../../../../api/monitor/server";

type ServerInfo = {
  cpu: {
    cpuNum: number;
    total: number;
    sys: number;
    used: number;
    wait: number;
    free: number;
  };
  mem: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  jvm: {
    total: number;
    max: number;
    free: number;
    version: string;
    home: string;
    name: string;
    startTime: string;
    usage: number;
    used: number;
    inputArgs: string;
    runTime: string;
  };
  sys: {
    computerName: string;
    computerIp: string;
    userDir: string;
    osName: string;
    osArch: string;
  };
  sysFiles: {
    dirName: string;
    sysTypeName: string;
    typeName: string;
    total: string;
    free: string;
    used: string;
    usage: number;
  }[];
};

export default function ServerDashboard() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getServer();
        // If API response is wrapped, extract data
        const data = res.data || res;
        setServerInfo(data as ServerInfo);
      } catch (err: any) {
        setError(err.message || "Failed to load server info");
      } finally {
        setLoading(false);
      }
    };
    fetchServerInfo();
  }, []);

  if (loading) {
    return <div className="p-6">Loading server info...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  if (!serverInfo) {
    return <div className="p-6">No server info available.</div>;
  }

  const { cpu, mem, jvm, sys, sysFiles } = serverInfo;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Server Monitoring</h1>

      {/* Responsive grid layout */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* CPU */}
        <section className="bg-white rounded-2xl p-4 shadow space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Cpu className="text-blue-500" /> CPU Overview
          </div>
          <p>Cores: {cpu.cpuNum}</p>
          <Progress value={cpu.used} className="h-3" />
          <div className="text-sm text-gray-600">
            Used: {cpu.used}%, System: {cpu.sys}%, Wait: {cpu.wait}%, Free: {cpu.free}%
          </div>
        </section>

        {/* Memory */}
        <section className="bg-white rounded-2xl p-4 shadow space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <MemoryStick className="text-green-500" /> Memory Usage
          </div>
          <p>
            Used: {mem.used} GB / {mem.total} GB
          </p>
          <Progress value={mem.usage} className="h-3" />
          <p className="text-sm text-gray-600">Free: {mem.free} GB</p>
        </section>

        {/* JVM */}
        <section className="bg-white rounded-2xl p-4 shadow space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <ServerCog className="text-purple-500" /> JVM Info
          </div>
          <p>
            Version: {jvm.version} | Name: {jvm.name}
          </p>
          <p>Used: {jvm.used} MB / {jvm.max} MB</p>
          <Progress value={jvm.usage} className="h-3" />
          <p className="text-sm text-gray-600">
            Start Time: {jvm.startTime}, Uptime: {jvm.runTime}
          </p>
        </section>

        {/* System Info */}
        <section className="bg-white rounded-2xl p-4 shadow space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Laptop2 className="text-orange-500" /> System Info
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><b>Host:</b> {sys.computerName}</li>
            <li><b>IP:</b> {sys.computerIp}</li>
            <li><b>OS:</b> {sys.osName} ({sys.osArch})</li>
            <li><b>Working Dir:</b> {sys.userDir}</li>
          </ul>
        </section>

        {/* Disk Files */}
        <section className="bg-white rounded-2xl p-4 shadow space-y-4 col-span-full xl:col-span-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <HardDrive className="text-red-500" /> Disk Usage
          </div>
          {sysFiles.map((file, idx) => (
            <div key={idx} className="border rounded-xl p-3 bg-gray-50">
              <p className="font-semibold">
                {file.typeName} ({file.dirName})
              </p>
              <Progress value={file.usage} className="h-2 mt-1" />
              <p className="text-xs text-gray-600">
                Used: {file.used} / {file.total} ({file.usage}%),
                Free: {file.free}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
