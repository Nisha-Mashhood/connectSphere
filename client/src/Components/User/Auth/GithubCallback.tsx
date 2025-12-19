import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  githubLogin,
  githubSignup,
} from "../../../Service/Auth.service";
import {
  setOtpContext,
} from "../../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";

const GithubCallback = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const query = new URLSearchParams(location.search);
      const code = query.get("code");
      const state = query.get("state");

      console.log("[GithubCallback] Callback received - Code:", code, "State:", state);

      if (!code) {
        toast.error("Authorization code is missing!");
        navigate("/login");
        return;
      }

      try {
        if (state === "signup") {
          console.log("Starting GitHub signup process");
          const { email, otpId } = await githubSignup(code);
          dispatch(
            setOtpContext({
              email,
              otpId,
              purpose: "signup",
            })
          );
          toast.success("OTP sent to your email");
          navigate("/otp");
          return;
        } else if (state === "login") {
          console.log("Starting GitHub login process");
          const { user, otpId } = await githubLogin(code);
          dispatch(
            setOtpContext({
              email: user.email,
              otpId,
              purpose: "login",
            })
          );
          toast.success("OTP sent to your email");
          navigate("/otp");
          return;
        } 
        toast.error("Invalid authentication state");
        navigate("/login");
      } catch (error) {
        console.error("Callback handling error:", error.message );
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    handleCallback();
  }, [location, navigate, dispatch]);

  return <div>Redirecting...</div>;
};

export default GithubCallback;
