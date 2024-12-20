import { Routes, Route } from "react-router-dom";
import Home from "./pages/User/Home";
import Header from "./Components/User/Header";
import Login from "./Components/User/Login";
import Signup from "./Components/User/Signup";
import ForgotPassword from "./Components/User/ForgotPassword";
import OTPVerification from "./Components/User/OtpVerification";
import ResetPassword from "./Components/User/ResetPassword";
import Profile from "./Components/User/Profile";
import Categories from "./Components/Admin/Categories";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "./Components/User/PrivateRoute";
// import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {
  // const GoogleOAuthWrapper = () =>{
  //   return(
  //     <GoogleOAuthProvider clientId='262075947289-073n0lv1ifch18cnipv6jl9vfqms9r5u.apps.googleusercontent.com'>
  //       <Login />
  //     </GoogleOAuthProvider>
  //   )
  // }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/reset" element={<ResetPassword />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        <Route path="/categories" element={<Categories />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
