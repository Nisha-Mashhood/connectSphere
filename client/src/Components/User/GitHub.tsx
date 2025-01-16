const GitHub = () => {

 const loginWithGithub = () => {
    const clientId = "Ov23livTA0yK7iMC3x1A"; 
    const redirectUri = "http://localhost:5173/github/callback"; 
    const state = encodeURIComponent("login");
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=user:email`;
    
    console.log("Signup URL:", githubUrl); 
    window.location.assign(githubUrl)
  };

  return (
    <div><button
    type="button"
    className="w-full block bg-black hover:bg-gray-800 focus:bg-gray-800 text-white font-semibold rounded-lg px-4 py-3 mt-4"
    onClick={loginWithGithub}
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
      <span className="ml-4">Log in with GitHub</span>
    </div>
  </button></div>
  )
}

export default GitHub