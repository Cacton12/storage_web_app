import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    const token = sessionStorage.getItem("token");
    e.preventDefault(); // prevent default form submission
    setLoading(true);
    try {
      if (!email || !password) {
        setError("Email and password are required");
        setSuccess("");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setSuccess("");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5219/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          password: password,
          name: name,
        }),
      });

      const data = await response.json();

      console.log(data);

      if (!response.ok) {
        setError(data.message || "Signup failed");
        setSuccess("");
        setLoading(false);
        return;
      }

      setSuccess(`User ${data.email} created successfully!`);
      setError("");
      setLoading(false);
      setEmail("");
      setPassword("");
      navigate('/main'); // Redirect to main page after successful signup
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      setSuccess("");
      setLoading(false);
    }
  };

  return (
    //leftside image
    <div className={`h-screen w-full flex flex-col md:flex-row ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-neutral-200 dark:bg-neutral-800 hover:scale-110 transition-transform"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-neutral-800" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400" />
        )}
      </button>
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
      <div className={`h-full md:w-1/2 ${theme === "dark" ? "bg-neutral-900" : "bg-[#f8f8f3]"} flex justify-center items-center`}>
        <form className="w-3/4 max-w-md p-8" onSubmit={handleSignUp}>
          <h2 className="text-2xl font-bold text-[#51803e] mb-6 text-center">
            Sign Up
          </h2>
          <div className="mb-4">
            <label className={`block mb-2 ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51803e] placeholder-[#9ca3af] border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" : "bg-[#fcfdfb] border-[#9ca3af]"}`}
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51803e] placeholder-[#9ca3af] border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" : "bg-[#fcfdfb] border-[#9ca3af]"}`}
            />
          </div>
          <div className="mb-4">
            <label className={`block mb-2 ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51803e] placeholder-[#9ca3af] border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" : "bg-[#fcfdfb] border-[#9ca3af]"}`}
            />
          </div>
          <div className="mb-6">
            <label
              className={`block mb-2 ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`}
              htmlFor="confirm-password"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51803e] placeholder-[#9ca3af] border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" : "bg-[#fcfdfb] border-[#9ca3af]"}`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-transform 
    ${
      loading
        ? "bg-gray-400 cursor-not-allowed animate-pulse"
        : "bg-[#379937] hover:bg-[#2f7a2f] active:scale-95"
    }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          {error && <p className={`mt-2 ${theme === "dark" ? "text-red-400" : "text-red-500"}`}>{error}</p>}
          {success && <p className={`mt-2 ${theme === "dark" ? "text-green-400" : "text-green-500"}`}>{success}</p>}

          <p className={`pt-3 flex justify-center items-center ${theme === "dark" ? "text-neutral-300" : "text-neutral-900"}`}>
            Already have an account? click{" "}
            <Link to={"/"} className="text-[#379937] pl-1 pr-1">
              here
            </Link>{" "}
            to log in
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
