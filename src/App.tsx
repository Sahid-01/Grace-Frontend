import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "@/stores/Auth/auth";
import router from "@/Routers/router";
import axios from "axios";

const App = () => {
  const { token, self, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Set axios default header if token exists
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fetch user data if authenticated but no user data
      if (isAuthenticated) {
        self();
      }
    }
  }, [token, isAuthenticated, self]);

  return <RouterProvider router={router} />;
};

export default App;
