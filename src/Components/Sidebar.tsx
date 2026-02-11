import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Users } from "lucide-react";
import { useAuthStore } from "@/stores/Auth/auth";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onItemClick?: () => void;
}

const Sidebar = ({
  isCollapsed,
  onToggleCollapse,
  onItemClick,
}: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users className="w-5 h-5" />,
      hideForRoles: ["student"], // Hide for students
    },
    {
      name: "Classes",
      path: "/classes",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: <Users className="w-5 h-5" />,
      hideForRoles: [],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.hideForRoles && user?.role) {
      return !item.hideForRoles.includes(user.role.toLowerCase());
    }
    return true;
  });

  return (
    <div
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      } border-r border-gray-200 z-30 overflow-hidden`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#1164A3]/5 to-[#1A9641]/5">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-base font-bold text-[#1164A3]">Navigation</h2>
          )}
          <button
            onClick={onToggleCollapse}
            className={`p-2 rounded-lg hover:bg-white transition-all duration-200 border border-gray-200 hover:border-[#1164A3] ${
              isCollapsed ? "mx-auto" : ""
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-4 h-4 text-gray-600 hover:text-[#1164A3] transition-all duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 overflow-y-auto h-[calc(100%-5rem)]">
        <ul className="space-y-1.5">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onItemClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#1164A3] to-[#1A9641] text-white shadow-md"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-[#1164A3]/10 hover:to-[#1A9641]/10"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <span
                    className={`transition-all duration-200 ${
                      isActive ? "text-white" : "text-[#1164A3]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span
                        className={`font-medium transition-all duration-200 ${
                          isActive ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {item.name}
                      </span>
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-[#1164A3]/10 to-[#1A9641]/10 rounded-lg p-3 border border-[#1164A3]/20">
            <p className="text-xs text-[#1164A3] text-center font-semibold">
              Grace International
            </p>
            <p className="text-xs text-gray-500 text-center mt-0.5">
              Version 1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
