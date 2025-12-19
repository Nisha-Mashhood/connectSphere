import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signinStart, signinFailure, setOtpContext } from '../../../redux/Slice/userSlice';
import { googleLogin } from '../../../Service/Auth.service';
import toast from 'react-hot-toast';
import { AppDispatch } from '../../../redux/store';

const GoogleLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    scope: 'openid email profile',
    flow: 'auth-code',
    onSuccess: async (response) => {
      try {
        dispatch(signinStart());
        const result = await googleLogin(response.code);        
        if (result.user) {
          dispatch(
          setOtpContext({
            email: result.user.email,
            otpId: result.otpId,
            purpose: "login",
          })
        );
        toast.success("OTP sent to your email");
        navigate("/otp");

        }
      } catch (error) {
        dispatch(signinFailure(error.message));
        toast.error('Google login failed');
        console.log("Google Login failed : ",error.message)
      }
    },
    onError: () => {
      toast.error('Google login failed');
    },
  });

  return (
    <div>
      <button
        type="button"
        onClick={() => login()}
        className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300"
      >
        <div className="flex items-center justify-center">
          <img
            className="w-9 h-5"
            src="https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png"
            alt="Google Icon"
          />
          <span className="ml-4">Log in with Google</span>
        </div>
      </button>
    </div>
  );
};

export default GoogleLogin;