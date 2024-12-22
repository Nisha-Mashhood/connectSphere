import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";

const PageNotFound = () => {
    const { currentUserAdmin } = useSelector((state: RootState) => state.user);
    const { currentUser } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (currentUserAdmin) {
      // Admin is logged in, redirect to admin dashboard
      navigate('/admin/dashboard');
    } else if (!currentUserAdmin && !currentUser) {
      // No user or admin is logged in
      navigate('/login');
    } else if (currentUser) {
      navigate('/')
  }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Image */}
      <img
        src="https://via.placeholder.com/400x300.png?text=404+-+Page+Not+Found"
        alt="404 Not Found"
        className="max-w-full h-auto"
      />

      {/* Text Content */}
      <div className="text-center mt-6">
        <h1 className="text-4xl font-bold text-gray-800">Oops! Page Not Found</h1>
        <p className="mt-4 text-lg text-gray-600">
          We can't seem to find the page you're looking for.
        </p>
      </div>

      {/* Go Back Button */}
      <button
        onClick={handleGoHome}
        className="mt-6 px-6 py-3 bg-green-500 text-white font-medium text-lg rounded-lg shadow-md hover:bg-green-600 transition duration-300"
      >
        Go Back Home
      </button>
    </div>
  );
};

export default PageNotFound;
