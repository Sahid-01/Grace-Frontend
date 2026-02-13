import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/Components/Navbar";
import Sidebar from "@/Components/Sidebar";

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile (lg breakpoint) */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        <main
          className="flex-1 transition-all duration-300 ease-in-out lg:ml-20"
          style={{
            marginLeft:
              window.innerWidth >= 1024
                ? isSidebarCollapsed
                  ? "5rem"
                  : "16rem"
                : "0",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
