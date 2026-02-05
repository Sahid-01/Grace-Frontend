import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/Components/Navbar";
import Sidebar from "@/Components/Sidebar";

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div className="flex">
        {/* Mobile Sidebar */}
        <div
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 md:hidden transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            isCollapsed={false}
            onToggleCollapse={toggleSidebar}
            onItemClick={closeMobileMenu}
          />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 bg-[#1a365d] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#2c5282] transition-all duration-200 active:scale-95"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <main
          className={`flex-1 transition-all duration-300 ease-in-out`}
          style={{
            marginLeft: isMobile ? "0" : isSidebarCollapsed ? "5rem" : "16rem",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
