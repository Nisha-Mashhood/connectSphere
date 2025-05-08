import { useLocation, useNavigate } from "react-router-dom";
import { AdminRoutes, UserRoutes } from "./routes/routes";
import { Toaster } from "react-hot-toast";
import { setupInterceptors } from "./lib/axios";
import { useEffect } from "react";
import NotificationHandler from "./Components/User/Common/NotificationHandler";


function App() {
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);

  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
    <NotificationHandler />
      {isAdminRoute ? <AdminRoutes /> : <UserRoutes />}
      <Toaster />
    </>
  );
}

export default App;
