import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const AdminDashboard = () => {
  const { currentAdmin } = useSelector((state: RootState) => state.user);
  
  
  return (
    <div>
      Welcome {currentAdmin.name}
    </div>
  )
}

export default AdminDashboard