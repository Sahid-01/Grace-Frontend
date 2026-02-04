import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/Components/Navbar";
import Sidebar from "@/Components/Sidebar";

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? "ml-0" : "ml-0"
          }`}
          style={{
            width: isSidebarCollapsed
              ? "calc(100% - 4rem)"
              : "calc(100% - 16rem)",
            marginLeft: isSidebarCollapsed ? "4rem" : "16rem",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
