import * as LucideIcons from "lucide-react";

type IconName = keyof typeof LucideIcons;

type MenuItem = {
  icon: IconName;
  label: string;
  href?: string;
  visible: string[];
  children?: MenuItem[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

export const menuItems: MenuSection[] = [
  {
    title: "",
    items: [
      {
        icon: "Gauge",
        label: "Dashboard",
        href: "/admin",
        visible: ["admin:dashboard:list"],
      },
      {
        icon: "Settings",
        label: "System Management",
        visible: ["system:management:list"],
        children: [
          {
            icon: "User",
            label: "Users",
            href: "/admin/system/user",
            visible: ["system:user:list"],
          },
          {
            icon: "ShieldCheck",
            label: "Roles",
            href: "/admin/system/role",
            visible: ["system:role:list"],
          },
          {
            icon: "List",
            label: "Menus",
            href: "/admin/system/menu",
            visible: ["system:menu:list"],
          },
          {
            icon: "BookOpen",
            label: "Dictionary",
            href: "/admin/system/dict",
            visible: ["system:dict:list"],
          },
          {
            icon: "SlidersHorizontal",
            label: "Configuration",
            href: "/admin/system/config",
            visible: ["system:config:list"],
          },
          {
            icon: "Bell",
            label: "Notification",
            href: "/admin/system/notification",
            visible: ["system:notice:list"],
          },
          {
            icon: "Briefcase",
            label: "Position",
            href: "/admin/system/position",
            visible: ["system:post:list"],
          },
          {
            icon: "Users",
            label: "Department",
            href: "/admin/system/dept",
            visible: ["system:dept:list"],
          },
        ],
      },
      {
        icon: "Monitor",
        label: "System Monitoring",
        visible: ["system:monitoring:list"],
        children: [
          {
            icon: "Users",
            label: "Online Users",
            href: "/admin/monitor/online",
            visible: ["monitor:online:list"],
          },
          {
            icon: "Server",
            label: "Server",
            href: "/admin/monitor/server",
            visible: ["monitor:server:list"],
          },
          {
            icon: "FileText",
            label: "Operation Log",
            href: "/admin/monitor/log",
            visible: ["monitor:operlog:list"],
          },
          {
            icon: "Key",
            label: "Login Log",
            href: "/admin/monitor/log/login",
            visible: ["monitor:logininfor:list"],
          },
          {
            icon: "HardDrive",
            label: "Cache",
            href: "/admin/monitor/cache",
            visible: ["monitor:cache:list"],
          },
          {
            icon: "Database",
            label: "Cache List",
            href: "/admin/monitor/cache/list",
            visible: ["monitor:cache:list"],
          },
        ],
      },
    ],
  },
];