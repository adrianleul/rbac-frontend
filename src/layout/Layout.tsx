import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { Provider } from "react-redux";
import store from "../store";
import { ChevronLeft, MenuIcon } from "lucide-react";
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { selectUserPermissions } from '../features/user/userSlice';

export default function DashboardLayout() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const permissions = useSelector(selectUserPermissions);

  // Responsive: collapse to icons on desktop, overlay on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(false); // Always expanded on mobile, but hidden by overlay
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar collapse (icon-only) on desktop
  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Toggle sidebar overlay on mobile
  const toggleSidebarMobile = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <div className="flex h-screen">
      <Provider store={store}>
        {/* Sidebar for desktop & overlay for mobile */}
        {/* Desktop sidebar */}
        <div
          ref={sidebarRef}
          className={`hidden md:flex flex-col h-full transition-all duration-300 bg-white border-r z-20
            ${isCollapsed ? "w-16" : "w-64"}
          `}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/admin" className="flex items-center">
              <img src="/Public/app/logo.png" alt="log" width={45} height={45} />
              {!isCollapsed && (
                <span className="ml-2 text-center font-semibold">
                  Role Based Access Control System
                </span>
              )}
            </Link>
          </div>
          <Sidebar permissions={permissions} isCollapsed={isCollapsed} />
        </div>
        {/* Mobile sidebar overlay */}
        <div
          className={`fixed inset-0 z-30 md:hidden flex transition-transform duration-300 ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Sidebar */}
          <div className="w-64 h-full bg-white shadow-xl flex flex-col z-40">
            <div className={`flex items-center justify-between p-4 border-b`}>
              <Link to="/admin" className="flex items-center">
                <img src="/Public/app/logo.png" alt="log" width={40} height={40} />
                <span className="ml-2 text-center font-semibold">
                  Role Based Access Control System
                </span>
              </Link>
              <button
                onClick={toggleSidebarMobile}
                className="ml-2 p-2 rounded-full hover:bg-gray-100 shadow-md"
                aria-label="Close sidebar"
              >
                <ChevronLeft size={25} />
              </button>
            </div>
            <Sidebar permissions={permissions} isCollapsed={false} />
          </div>
          {/* Overlay: only this closes the sidebar on click */}
          <div className="flex-1" onClick={toggleSidebarMobile} style={{ background: "rgba(0,0,0,0.3)" }} />
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col bg-gray-200 overflow-auto">
          {/* Navbar section */}
          <div className="bg-white flex items-center p-2 shadow-lg z-10">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebarMobile}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 transition mr-2"
              aria-label="Open sidebar"
            >
              <MenuIcon size={25} />
            </button>
            {/* Desktop collapse button (duplicate for sticky navbar) */}
            <div className="hidden md:flex items-center">
            </div>
            <button
              onClick={toggleCollapse}
              className="ml-2 p-2 rounded-full shadow-md hover:bg-gray-100 hidden md:block"
              aria-label="Toggle sidebar"
            >
              <ChevronLeft size={25} className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
            </button>
            <div className="flex-1">
              <Navbar />
            </div>
          </div>
          {/* Main body */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </Provider>
    </div>
  );
}