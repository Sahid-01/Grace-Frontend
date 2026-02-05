import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { ChevronDown, User, LogOut } from "lucide-react";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
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

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#1a365d]">
                  Grace International
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Learning Management System
                </p>
              </div>
            </div>
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-offset-2 rounded-lg px-2 sm:px-4 py-2 transition-all duration-200 hover:bg-gray-50"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#1a365d] to-[#2c5282] rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                <span className="text-white font-bold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {user?.full_name || user?.name || user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || "Member"}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 text-gray-500 ${
                  isDropdownOpen ? "rotate-180 text-[#1a365d]" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-xl ring-1 ring-gray-200 z-50 overflow-hidden">
                <div className="py-2">
                  {/* User Info */}
                  <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#1a365d] to-[#2c5282] rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
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
                          <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-semibold text-[#1a365d] bg-blue-50 rounded-full capitalize">
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
                      className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-150 rounded-lg"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-[#1a365d]" />
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
                        <LogOut className="w-4 h-4 text-[#c41e3a]" />
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
    </nav>
  );
};

export default Navbar;
