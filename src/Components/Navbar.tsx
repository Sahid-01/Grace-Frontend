import { useState } from "react";

interface User {
  id: string;
  username: string;
  name?: string;
  full_name?: string;
  role?: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:inline">
              AppName
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/dashboard"
              className="text-gray-700 hover:text-emerald-600 font-medium transition"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium transition"
            >
              Profile
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium transition"
            >
              Settings
            </a>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user && (
              // User is logged in - Show user menu
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.full_name?.charAt(0).toUpperCase() ||
                      user.name?.charAt(0).toUpperCase() ||
                      user.username?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {user.full_name || user.name || user.username}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name || user.name || user.username}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                      {user.role && (
                        <p className="text-xs text-emerald-600 font-medium capitalize mt-1">
                          {user.role}
                        </p>
                      )}
                    </div>

                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      My Profile
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      Settings
                    </a>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
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
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200 pt-4">
            <a
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
            >
              Profile
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
            >
              Settings
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
