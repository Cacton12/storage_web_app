import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, AlertCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import apiClient from "../utils/apiClient";
import { getUserFriendlyMessage } from "../utils/apiErrorHandler";
import { validateSignupForm } from "../utils/validation";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    setGeneralError("");
    
    // Validate form
    const validation = validateSignupForm(name, email, password, confirmPassword);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post("/api/signup", {
        email: email.trim(),
        password: password,
        name: name.trim(),
      });

      if (data.success || data.email) {
        // Store token and user data
        if (data.token) {
          apiClient.setToken(data.token);
        }
        if (data.user) {
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }
        
        navigate('/main');
      } else {
        setGeneralError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setGeneralError(getUserFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {/* Right side signup */}
      <div className={`h-full md:w-1/2 ${theme === "dark" ? "bg-neutral-900" : "bg-[#f8f8f3]"} flex justify-center items-center`}>
        <form className="w-3/4 max-w-md p-8" onSubmit={handleSignUp}>
          <h2 className="text-2xl font-bold text-[#51803e] mb-6 text-center">
            Sign Up
          </h2>

          {/* General Error Message */}
          {generalError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-sm">{generalError}</p>
            </div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label className={`block mb-2 ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleFieldChange("name", e.target.value, setName)}
              placeholder="Your Name"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 placeholder-[#9ca3af] border ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-[#51803e]"
              } ${
                theme === "dark" 
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" 
                  : "bg-[#fcfdfb] border-[#9ca3af]"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={`block mb-2 ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
              placeholder="you@example.com"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 placeholder-[#9ca3af] border ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-[#51803e]"
              } ${
                theme === "dark" 
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" 
                  : "bg-[#fcfdfb] border-[#9ca3af]"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className={`block mb-2 ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
              placeholder="Enter password"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 placeholder-[#9ca3af] border ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-[#51803e]"
              } ${
                theme === "dark" 
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" 
                  : "bg-[#fcfdfb] border-[#9ca3af]"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
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
              onChange={(e) => handleFieldChange("confirmPassword", e.target.value, setConfirmPassword)}
              placeholder="Confirm password"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 placeholder-[#9ca3af] border ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-[#51803e]"
              } ${
                theme === "dark" 
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" 
                  : "bg-[#fcfdfb] border-[#9ca3af]"
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-2 px-4 rounded-lg transition-transform ${
              loading
                ? "bg-gray-400 cursor-not-allowed animate-pulse"
                : "bg-[#379937] hover:bg-[#2f7a2f] active:scale-95"
            }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

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