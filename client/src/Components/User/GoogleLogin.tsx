import { useGoogleLogin } from '@react-oauth/google'


const GoogleLogin = () => {

    // const responseGoogle = async(authResult) =>{
    //     try {
    //         console.log(authResult)
    //     } catch (error) {
    //         console.log("error google code :",error);
    //     }
    // }

    // const handlegoogleLogin = useGoogleLogin({
    //     onSuccess:responseGoogle,
    //     onError:responseGoogle,
    //     flow:'auth-code'
    // })
  return (
    <div><button
    type="button"
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
  </button></div>
  )
}

export default GoogleLogin