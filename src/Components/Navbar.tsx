import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/Auth/auth";
import {
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Users,
} from "lucide-react";
import logo from "@/assets/logo1.png";
// import logo1 from "@/assets/logo.png";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    // All users go to their own profile page
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = user?.full_name || user?.name || user?.username || "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Menu items for mobile navigation
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
      hideForRoles: ["student"],
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
    <nav className="bg-gradient-to-r from-[#1164A3] to-[#1A9641] shadow-lg border-b border-[#0d5189] sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1164A3] transition-all duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20 p-2">
                <img
                  src={logo}
                  alt="Grace International Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20 p-2">
                <img src={logo1} alt="Grace International Logo" className="w-full h-full object-contain" />
              </div> */}
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  Grace International
                </h1>
                <p className="text-xs text-white/90 hidden sm:block">
                  Learning Management System
                </p>
              </div>
            </div>
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 text-white hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1164A3] rounded-lg px-2 sm:px-4 py-2 transition-all duration-200 hover:bg-white/10"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-white/30 to-white/20 rounded-full flex items-center justify-center shadow-md ring-2 ring-white/30">
                <span className="text-white font-bold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white truncate max-w-[150px]">
                  {user?.full_name || user?.name || user?.username || "User"}
                </p>
                <p className="text-xs text-white/80 capitalize">
                  {user?.role || "Member"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 text-white/80 ${
                  isDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl ring-1 ring-gray-200 z-50 overflow-hidden">
                <div className="py-2">
                  {/* User Info */}
                  <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-[#1164A3]/5 to-[#1A9641]/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#1164A3] to-[#1A9641] rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                        <span className="text-white font-bold text-lg">
                          {getUserInitials()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.full_name || user?.name || user?.username}
                        </p>
                        {user?.email && (
                          <p className="text-xs text-gray-600 truncate mt-0.5">
                            {user.email}
                          </p>
                        )}
                        {user?.role && (
                          <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1164A3] to-[#1A9641] rounded-full capitalize">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2 px-2">
                    {/* Profile Link */}
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-[#1164A3]/5 transition-all duration-150 rounded-lg"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#1164A3]/10 flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-[#1164A3]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">Profile</p>
                        <p className="text-xs text-gray-500">
                          View your profile
                        </p>
                      </div>
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-red-50 transition-all duration-150 rounded-lg mt-1"
                    >
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">Logout</p>
                        <p className="text-xs text-gray-500">
                          Sign out of your account
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40"
        >
          <nav className="p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#1164A3] to-[#1A9641] text-white shadow-md"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-[#1164A3]/10 hover:to-[#1A9641]/10"
                      }`}
                    >
                      <span
                        className={`transition-all duration-200 ${
                          isActive ? "text-white" : "text-[#1164A3]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`font-medium transition-all duration-200 ${
                          isActive ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {item.name}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
