import { Outlet } from 'react-router-dom';
import Navbar from '../Components/Navbar' // adjust if your Navbar is somewhere else

const Layout = () => {
  return (
    <div>
      <header>
        <Navbar />
        {/* You can add nav links here */}
      </header>

      <main>
        {/* Nested routes will render here */}
        <Outlet />
      </main>

      <footer>
        <p>© 2026 My App</p>
      </footer>
    </div>
  );
};

export default Layout;
