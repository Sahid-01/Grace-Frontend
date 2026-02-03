import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useAuthStore } from "../stores/auth";

const Layout = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <header>
        <Navbar user={user} onLogout={handleLogout} />
      </header>

      <main>
        {/* Nested routes will render here */}
        <Outlet />
      </main>

      <footer className="bg-gray-100 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2026 My App</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
