import { useLocation } from "react-router-dom";
import { AdminRoutes, UserRoutes } from "./routes/index";
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();

  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {isAdminRoute ? <AdminRoutes /> : <UserRoutes />}
      <Toaster />
    </>
  );
}

export default App;
