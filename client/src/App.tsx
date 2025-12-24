import { useLocation, useNavigate } from "react-router-dom";
import { AdminRoutes, UserRoutes } from "./routes/routes";
import { Toaster } from "react-hot-toast";
import { setupInterceptors } from "./lib/axios";
import { useEffect } from "react";
import NotificationHandler from "./Components/User/Home/NotificationHandler";
import { useReviewModalTimer } from "./Service/useReviewModalTimer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./redux/store";
import ReviewModal from "./Components/Forms/ReviewModal";
import { setIsInChatComponent } from "./redux/Slice/notificationSlice";


function App() {
  const navigate = useNavigate();
  const location = useLocation();
   const dispatch = useDispatch();
  const { currentUser, needsReviewPrompt } = useSelector((state: RootState) => state.user);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const { isModalOpen, setIsModalOpen } = useReviewModalTimer(needsReviewPrompt, isAdminRoute);


  useEffect(() => {
    setupInterceptors(navigate);
  }, [navigate]);

  useEffect(() => {
    const isChatRoute = location.pathname.startsWith("/chat");
    dispatch(setIsInChatComponent(isChatRoute));
  }, [dispatch, location.pathname]);

  return (
    <>
    <NotificationHandler />
      {isAdminRoute ? <AdminRoutes /> : <UserRoutes />}
      {currentUser && !isAdminRoute && (
        <ReviewModal
          isOpen={isModalOpen}
          userId={currentUser._id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <Toaster />
    </>
  );
}

export default App;
