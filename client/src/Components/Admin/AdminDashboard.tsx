import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";

const AdminDashboard = () => {
  const { currentUserAdmin } = useSelector((state: RootState) => state.user);
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (!currentUserAdmin) {
  //     navigate("/admin/login", { replace: true });
  //   }
  // }, [currentUserAdmin, navigate]);

  if (!currentUserAdmin) {
    return null; 
  }

  
  return (
    <div>
      Welcome {currentUserAdmin.name}
    </div>
  )
}

export default AdminDashboard