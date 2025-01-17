import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signinStart, signinSuccess, signinFailure } from '../../../redux/Slice/userSlice';
import { checkProfile, googleLogin } from '../../../Service/Auth.service';
import toast from 'react-hot-toast';

const GoogleLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    scope: 'openid email profile',
    flow: 'auth-code',
    onSuccess: async (response) => {
      try {
        dispatch(signinStart());
        
        // Call the Google Login API
        const result = await googleLogin(response.code);
        console.log(result);
        
        if (result.user) {
          // Dispatch user data to Redux store
          dispatch(signinSuccess(result.user));
          toast.success('Login successful!');

          // Check if profile is complete
          const profileResponse = await checkProfile(result.user._id);
          if (!profileResponse.isProfileComplete) {
            navigate('/complete-profile');
            return;
          }

          // Navigate to the homepage
          navigate('/');
        }
      } catch (error: any) {
        dispatch(signinFailure(error.message));
        toast.error(error.message || 'Google login failed');
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