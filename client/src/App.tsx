import { useLocation, useNavigate } from "react-router-dom";
import { AdminRoutes, UserRoutes } from "./routes/routes";
import { Toaster } from "react-hot-toast";
import { setupInterceptor } from "./lib/axios";
import { useEffect } from "react";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setupInterceptor(navigate);
  }, [navigate]);

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
