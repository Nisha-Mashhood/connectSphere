import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { RootState } from "../../redux/store";

 
function AdminPrivateRoute() {
        const { isAdmin } = useSelector((state: RootState) => state.user);
        return isAdmin ? <Outlet /> : <Navigate to="/admin/login" />;
}

export default AdminPrivateRoute