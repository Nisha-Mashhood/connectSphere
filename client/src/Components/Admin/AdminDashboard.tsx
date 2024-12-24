import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const AdminDashboard = () => {
  const { currentUserAdmin } = useSelector((state: RootState) => state.user);
  
  
  return (
    <div>
      Welcome {currentUserAdmin.name}
    </div>
  )
}

export default AdminDashboard