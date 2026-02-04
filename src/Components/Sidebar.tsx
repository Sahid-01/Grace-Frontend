import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Users } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

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
      name: "classes",
      path: "/classes",
      icon: <FileText className="w-5 h-5" />,
    },
    // {
    //   name: "Profile",
    //   path: "/profile",
    //   icon: <User className="w-5 h-5" />,
    // },
    // {
    //   name: "Settings",
    //   path: "/settings",
    //   icon: <Settings className="w-5 h-5" />,
    // },
    // {
    //   name: "Analytics",
    //   path: "/analytics",
    //   icon: <BarChart3 className="w-5 h-5" />,
    // },
    // {
    //   name: "Reports",
    //   path: "/reports",
    //   icon: <FileText className="w-5 h-5" />,
    // },
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
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      } border-r border-gray-200 z-30`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Menu
            </h2>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 transition-all duration-200 border border-gray-200 hover:border-emerald-300 group"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-4 h-4 text-gray-600 group-hover:text-emerald-600 transition-all duration-300 ${
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
      <nav className="p-4 overflow-y-auto h-[calc(100%-5rem)]">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onItemClick}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm hover:border hover:border-gray-200"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <span
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-emerald-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium transition-all duration-200">
                      {item.name}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {item.name}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
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
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
            <p className="text-xs text-emerald-700 text-center font-medium">
              Grace Dashboard v1.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
