import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signinFailure, signinStart } from '../../redux/Slice/userSlice';
import { googleSignup } from '../../Service/Auth.service';
import toast from 'react-hot-toast';

const GoogleSignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signup = useGoogleLogin({
    scope: 'openid email profile',
    flow: 'auth-code',
    onSuccess: async (response) => {
      try {
        console.log(response);

        dispatch(signinStart());
         const data = await googleSignup(response.code);
         console.log("data:",data);

         toast.success('Signup successful! Please login to continue');
        navigate('/login');
      } catch (error: any) {
        dispatch(signinFailure(error.message));
        toast.error(error.message || 'Google signup failed');
      }
    },
    onError: () => {
      toast.error('Google signup failed');
    }
  });

  return (
    <button
      type="button"
      onClick={() => signup()}
      className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300"
    >
      <div className="flex items-center justify-center">
        <img
          className="w-9 h-5"
          src="https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png"
          alt="Google Icon"
        />
        <span className="ml-4">Sign up with Google</span>
      </div>
    </button>
  );
};

export default GoogleSignup;