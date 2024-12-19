import restImage from '../../assets/Reset Password.png'
const ResetPassword = () => {
    return (
      <div>
        <section className="flex flex-col md:flex-row h-screen items-center">
          {/* Left Section with SVG */}
          <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
            <img
              src={restImage}
              alt="Reset Password Illustration"
              className="w-full h-full object-cover"
            />
          </div>
  
          {/* Right Section with Reset Password Form */}
          <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
            <div className="w-full h-100">
              <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
                Reset Your Password
              </h1>
              <p className="text-gray-600 mt-2">Create a new password below.</p>
  
              <form className="mt-6" action="#" method="POST">
                <div>
                  <label className="block text-gray-700">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter New Password"
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
  
                <div className="mt-4">
                  <label className="block text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
  
                <button
                  type="submit"
                  className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg px-4 py-3 mt-6"
                >
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  };
  
  export default ResetPassword;
  