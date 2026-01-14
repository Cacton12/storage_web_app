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
    <div className={`min-h-screen w-full ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Hero Image (hidden on mobile) */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-center p-10 lg:p-16"
          style={{
            backgroundImage: `url('/images/FoggyTrees.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="text-5xl xl:text-6xl font-bold text-neutral-800 mb-6">
            Store Your Photos Safely
          </h1>
          <p className="text-xl xl:text-2xl text-white max-w-lg">
            Keep your memories secure and organized. Sign up today and never lose
            a photo again!
          </p>
        </div>

        {/* Right side - Sign Up Form */}
        <div className={`relative w-full lg:w-1/2 flex justify-center items-center ${theme === "dark" ? "bg-neutral-900" : "bg-[#f8f8f3]"} min-h-screen`}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`fixed top-4 right-4 lg:absolute lg:top-6 lg:right-6 z-40 p-2.5 rounded-full hover:scale-110 transition-all shadow-lg ${
              theme === "light" 
                ? "bg-neutral-200 hover:bg-neutral-300" 
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-neutral-800" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>

          {/* Form Container */}
          <div className="w-full max-w-md px-6 py-8 sm:px-8 lg:px-6">
            {/* Mobile Header (only shown on mobile) */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#51803e] mb-2">
                Join Us Today!
              </h1>
              <p className={`text-sm ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
                Create an account to store your photos securely
              </p>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-[#51803e] mb-6 text-center">
              Sign Up
            </h2>

            {/* General Error Message */}
            {generalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 flex items-start gap-2 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{generalError}</p>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name */}
              <div>
                <label 
                  className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} 
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => handleFieldChange("name", e.target.value, setName)}
                  placeholder="Your Name"
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 border transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-[#51803e]"
                  } ${
                    theme === "dark" 
                      ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" 
                      : "bg-[#fcfdfb] border-[#9ca3af] placeholder-[#9ca3af]"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label 
                  className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} 
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 border transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-[#51803e]"
                  } ${
                    theme === "dark" 
                      ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" 
                      : "bg-[#fcfdfb] border-[#9ca3af] placeholder-[#9ca3af]"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label 
                  className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`} 
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
                  placeholder="Enter password"
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 border transition-all ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-[#51803e]"
                  } ${
                    theme === "dark" 
                      ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" 
                      : "bg-[#fcfdfb] border-[#9ca3af] placeholder-[#9ca3af]"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-neutral-200" : "text-neutral-900"}`}
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
                  className={`w-full px-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 border transition-all ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "focus:ring-[#51803e]"
                  } ${
                    theme === "dark" 
                      ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" 
                      : "bg-[#fcfdfb] border-[#9ca3af] placeholder-[#9ca3af]"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-bold py-3 px-4 rounded-lg text-base transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#379937] hover:bg-[#2f7a2f] active:scale-[0.98] shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className={`mt-6 text-sm text-center ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
              Already have an account?{" "}
              <Link to="/" className="text-[#379937] font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SignUpForm;