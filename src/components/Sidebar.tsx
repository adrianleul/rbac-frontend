import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ChevronUp, ChevronRight } from "lucide-react";
import { menuItems as sidebarMenuItems } from '../layout/Sidebar';
import { useSelector } from 'react-redux';
import { selectUserRoles, selectUserPermissions } from '../features/user/userSlice';

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

type MenuProps = {
  permissions: string[];
  isCollapsed: boolean;
};

// Copy menuItems from src/layout/Sidebar.tsx
const menuItems: MenuSection[] = sidebarMenuItems;

function hasPermission(permissions: string[], required: string[], roles: string[]): boolean {
  // Bypass if user is admin and has '*:*:*' permission
  if (roles.includes('admin') && permissions.includes('*:*:*')) {
    return true;
  }
  return required.some((perm) => permissions.includes(perm));
}

const Sidebar: React.FC<MenuProps> = ({ permissions: propPermissions, isCollapsed }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const roles = useSelector(selectUserRoles);
  const permissions = useSelector(selectUserPermissions);

  const handleToggle = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (!hasPermission(permissions, item.visible, roles)) return null;
    const Icon = (LucideIcons[item.icon] as React.ElementType) || LucideIcons["Circle"];
    const isActive = item.href && location.pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenu === item.label;

    // Parent menu (expandable)
    if (hasChildren) {
      return (
        <div key={item.label} className="relative font-semibold">
          <button
            className={`peer flex items-center w-full h-12 py-2 text-left hover:bg-grenn-300${isCollapsed ? " justify-center" : " px-4"}`}
            onClick={() => handleToggle(item.label)}
            style={{ paddingLeft: isCollapsed ? 0 : 16 + depth * 16 }}
          >
            <Icon className={`w-[30px] h-[30px]${!isCollapsed ? " mr-2" : ""} text-black`} />
            {!isCollapsed && <span className={`flex-1 ${isOpen ? "text-green-600 font-semibold" : "text-gray-700"}`}>{item.label}</span>}
            {!isCollapsed && (isOpen ? <ChevronUp className="w-4 h-4 text-green-600" /> : <ChevronRight className="w-4 h-4 text-gray-400" />)}
          </button>
          {/* Popout label on hover when collapsed for parent menu */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 top-6 z-50 hidden peer-hover:block bg-gray-900 text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap pointer-events-none">
              {item.label}
            </div>
          )}
          {isOpen && (
            <div className="ml-2 border-l border-gray-200">
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }
    // Single or child menu (navigable)
    return (
      <div key={item.label} className="relative font-semibold">
        <Link
          to={item.href || "#"}
          className={`peer flex items-center w-full py-2 hover:bg-green-300${isCollapsed ? " justify-center" : " px-4"} ${isActive ? " bg-green-500 text-white" : ""}`}
          style={{ paddingLeft: isCollapsed ? 0 : 16 + depth * 16 }}
        >
          <Icon className={`w-[30px] h-[30px]${!isCollapsed ? " mr-2" : ""} text-black`} />
          {!isCollapsed && <span className={`${isActive ? "text-white font-semibold" : "text-gray-700"}`}>{item.label}</span>}
        </Link>
        {/* Popout label on hover when collapsed */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden peer-hover:block bg-gray-900 text-white text-xs rounded px-3 py-1 shadow-lg whitespace-nowrap pointer-events-none">
            {item.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`h-full bg-white border-r w-${isCollapsed ? "16" : "64"} transition-all duration-200`}>
      <nav className="py-4">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            {section.title && !isCollapsed && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            {section.items.map((item) => renderMenuItem(item))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 