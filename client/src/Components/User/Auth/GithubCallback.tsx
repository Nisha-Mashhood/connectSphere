import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  checkProfile,
  githubLogin,
  githubSignup,
} from "../../../Service/Auth.service";
import {
  signinStart,
  signinFailure,
  signinSuccess,
} from "../../../redux/Slice/userSlice";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

const GithubCallback = () => {
  const dispatch = useDispatch();
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
          await handleGithubSignup(code);
        } else if (state === "login") {
          console.log("Starting GitHub login process");
          await handleGithubLogin(code);
        } else {
          console.error("Invalid state parameter:", state);
          toast.error("Invalid authentication request");
          navigate("/login");
        }
      } catch (error) {
        console.error("Callback handling error:", error.message );
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    handleCallback();
  }, [location]);

  const handleGithubLogin = async (code: string) => {
    try {
      dispatch(signinStart());
      const result = await githubLogin(code);
      console.log("[GithubCallback] Login response:", result);
      dispatch(signinSuccess({ user: result.user, needsReviewPrompt: result.needsReviewPrompt }));
      toast.success("Login successful!");


      const profileResponse = await checkProfile(result.user._id);
      if (!profileResponse.isProfileComplete) {
        navigate("/complete-profile");
        return;
      }

      navigate("/");
    } catch (error) {
      dispatch(signinFailure(error.message));
      if (error.response && error.response.status === 404) {
        toast.error("Email not registered. Please sign up first.");
        navigate("/signup");
      } else {
        toast.error(error.message || "GitHub login failed!");
      }
    }
  };

  const handleGithubSignup = async (code: string) => {
    try {
      dispatch(signinStart());
      await githubSignup(code);
      toast.success("Signup successful! Please login to continue.");
      navigate("/login");
    } catch (error) {
      dispatch(signinFailure(error.message));
      if (error.message === "Email already registered. Please login instead.") {
        toast.error("Email already registered. Please login instead.");
        navigate("/login");
      } else {
        toast.error(error.message || "GitHub signup failed!");
        navigate("/signup");
      }
    }
  };

  return <div>Redirecting...</div>;
};

export default GithubCallback;
