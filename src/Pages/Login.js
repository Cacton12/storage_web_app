const Login = () => {
  return (
    //leftside image
    <div className="h-screen w-full flex flex-col md:flex-row">
      {/* Left side image */}
      <div
        className="h-1/2 md:h-full w-full md:w-1/2 flex flex-col justify-center items-center text-center p-10 relative"
        style={{
          backgroundImage: `url('/images/FoggyTrees.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 mb-6">
          Store Your Photos Safely
        </h1>
        <p className="pb-20 md:pt-0 text-lg md:text-2xl text-white mb-10 max-w-md">
          Keep your memories secure and organized. Sign up today and never lose
          a photo again!
        </p>
      </div>

      {/* rightside signup */}
      <div className="h-full md:w-1/2 bg-[#f8f8f3] flex justify-center items-center">
        <form className="w-3/4 max-w-md p-8">
          <h2 className="text-2xl font-bold text-[#51803e] mb-6 text-center">
            Sign Up
          </h2>
          <div className="mb-4">
            <label className="block text-neutral-900 mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded-md bg-[#fcfdfb]  focus:outline-none focus:ring-2 focus:ring-[#51803e] placeholder-[#9ca3af] border border-[#9ca3af]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-neutral-900 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-md bg-[#fcfdfb]  focus:outline-none focus:ring-2 focus:ring-[#51803e] placeholder-[#9ca3af] border border-[#9ca3af]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-neutral-900 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded-md bg-[#fcfdfb]  focus:outline-none focus:ring-2 focus:ring-[#51803e] placeholder-[#9ca3af] border border-[#9ca3af]"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-neutral-900 mb-2"
              htmlFor="confirm-password"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm password"
              className="w-full px-4 py-2 rounded-md bg-[#fcfdfb]  focus:outline-none focus:ring-2 focus:ring-[#51803e] placeholder-[#9ca3af] border border-[#9ca3af]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#379937] text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login