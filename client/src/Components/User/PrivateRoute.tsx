import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { RootState } from "../../redux/store";

function PrivateRoute() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  if (!currentUser) {
    return <Navigate to="/login" state={{ error: "You need to log in first!" }} />;
  }
  return <Outlet />;
}

export default PrivateRoute;
