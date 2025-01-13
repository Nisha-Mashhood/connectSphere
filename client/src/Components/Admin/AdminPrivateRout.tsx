import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { RootState } from "../../redux/store";
import toast from "react-hot-toast";

 
function AdminPrivateRoute() {
        const { isAdmin } = useSelector((state: RootState) => state.user);
        const location = useLocation();

        if (!isAdmin) {
                toast.error("Access Forbidden - Admin rights required", {
                  position: "top-right",
                  duration: 3000,
                });
                return <Navigate to="/forbidden" state={{ from: location }} replace />;
              }


        return <Outlet />;
}

export default AdminPrivateRoute
