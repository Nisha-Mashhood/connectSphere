import SignupImage from '../../assets/Signup.png'

const Signup = () => {
  return (
    <div>
      <section className="flex flex-col md:flex-row h-screen items-center">
        

        {/* Left Section with Signup Form */}
        <div className="bg-white w-full md:max-w-md lg:max-w-full md:w-1/2 xl:w-1/3 h-screen px-6 lg:px-16 xl:px-12 flex items-center justify-center">
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight mt-12">
              Create an Account
            </h1>

            <form className="mt-6" action="#" method="POST">
              <div>
                <label className="block text-gray-700">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter Full Name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  placeholder="Create Password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg px-4 py-3 mt-6"
              >
                Sign Up
              </button>
            </form>
            <hr className="my-6 border-gray-300 w-full" />

            {/* Google Signup Button */}
            <button
              type="button"
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

            {/* GitHub Signup Button */}
            <button
              type="button"
              className="w-full block bg-black hover:bg-gray-800 focus:bg-gray-800 text-white font-semibold rounded-lg px-4 py-3 mt-4"
            >
              <div className="flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.167 6.84 9.489.5.088.68-.217.68-.483 0-.237-.01-1.022-.014-1.852-2.782.605-3.369-1.342-3.369-1.342-.455-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.532 1.032 1.532 1.032.893 1.53 2.341 1.088 2.912.833.092-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.934 0-1.09.39-1.98 1.03-2.678-.104-.253-.447-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.566 9.566 0 0112 6.843c.85.004 1.705.114 2.504.334 1.91-1.296 2.75-1.026 2.75-1.026.545 1.378.202 2.397.1 2.65.64.698 1.03 1.587 1.03 2.678 0 3.834-2.339 4.677-4.566 4.923.359.31.678.918.678 1.851 0 1.336-.012 2.415-.012 2.744 0 .268.18.575.688.479A10.007 10.007 0 0022 12c0-5.52-4.48-10-10-10z"
                  />
                </svg>
                <span className="ml-4">Sign up with GitHub</span>
              </div>
            </button>

            <p className="mt-8">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-500 hover:text-blue-700 font-semibold"
              >
                Log In
              </a>
            </p>
          </div>
        </div>
        {/* Right Section with Image */}
        <div className="bg-indigo-600 hidden lg:block w-full md:w-1/2 xl:w-2/3 h-screen">
          <img
            src={SignupImage}
            alt="Signup Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  )
}

export default Signup