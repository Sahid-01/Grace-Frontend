import { RouterProvider } from "react-router-dom";
import router from "./Routers/router";

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
