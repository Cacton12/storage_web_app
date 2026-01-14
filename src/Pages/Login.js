// src/Pages/Login.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, AlertCircle, WifiOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import apiClient from "../utils/apiClient";
import { validateLoginForm } from "../utils/validation";
import { getUserFriendlyMessage, isAuthError } from "../utils/apiErrorHandler";

const Login = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checking, setChecking] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [attemptCount, setAttemptCount] = useState(0);

  // Check if user is already logged in
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      navigate("/main", { replace: true });
    } else {
      setChecking(false);
    }
  }, [navigate]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError("");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setError("You are currently offline. Please check your internet connection.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear success after 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (checking) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError("");
    setSuccess("");
    setFieldErrors({});

    // Check network
    if (!isOnline) {
      setError("You are offline. Please check your internet connection.");
      return;
    }

    // Validate form
    const validation = validateLoginForm(email.trim(), password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError("Please correct the errors below.");
      return;
    }

    // Rate limiting check (simple client-side)
    if (attemptCount >= 5) {
      setError("Too many login attempts. Please wait a moment before trying again.");
      setTimeout(() => setAttemptCount(0), 60000); // Reset after 1 minute
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post("/api/login", {
        email: email.trim().toLowerCase(),
        password: password
      });

      // Save auth data
      apiClient.setToken(data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful! Redirecting...");
      setAttemptCount(0);
      
      // Small delay for success message
      setTimeout(() => {
        navigate("/main", { replace: true });
      }, 500);

    } catch (err) {
      setAttemptCount(prev => prev + 1);
      
      // Handle different error types
      if (isAuthError(err)) {
        setError("Invalid email or password. Please try again.");
        setFieldErrors({ 
          email: " ",
          password: " "
        });
      } else {
        setError(getUserFriendlyMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!isOnline) {
      setError("You are offline. Please check your internet connection.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post("/api/login", {
        email: "demo@demo.com",
        password: "demo"
      });

      apiClient.setToken(data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("isDemo", JSON.stringify(true));

      setSuccess("Demo login successful! Redirecting...");
      
      setTimeout(() => {
        navigate("/main", { replace: true });
      }, 500);

    } catch (err) {
      setError(getUserFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm z-50">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>No internet connection</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Hero Image (hidden on mobile) */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-center p-10 lg:p-16"
          style={{
            backgroundImage: `url('/images/Valley.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="text-5xl xl:text-6xl font-bold text-neutral-800 mb-6">
            Welcome Back!
          </h1>
          <p className="text-xl xl:text-2xl text-neutral-800 max-w-lg">
            Log in to securely access your photo collection.
          </p>
        </div>

        {/* Right side - Login Form */}
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

          {/* Login Form Container */}
          <div className="w-full max-w-md px-6 py-8 sm:px-8 lg:px-6">
            {/* Mobile Header (only shown on mobile) */}
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#51803e] mb-2">
                Welcome Back!
              </h1>
              <p className={`text-sm ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
                Log in to access your photos
              </p>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold text-[#51803e] mb-6 text-center">
              Log in to your account
            </h2>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg flex items-start gap-2 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg animate-fadeIn">
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    theme === "dark" ? "text-neutral-200" : "text-neutral-900"
                  }`}
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors(prev => ({ ...prev, email: "" }));
                  }}
                  placeholder="you@example.com"
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg text-base border focus:ring-2 focus:ring-[#51803e] focus:outline-none transition-all ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : theme === "dark"
                      ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                      : "bg-[#fcfdfb] border-[#9ca3af]"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  className={`block mb-2 text-sm font-medium ${
                    theme === "dark" ? "text-neutral-200" : "text-neutral-900"
                  }`}
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors(prev => ({ ...prev, password: "" }));
                  }}
                  placeholder="Enter password"
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg text-base border focus:ring-2 focus:ring-[#51803e] focus:outline-none transition-all ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : theme === "dark"
                      ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                      : "bg-[#fcfdfb] border-[#9ca3af]"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {fieldErrors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading || !isOnline}
                className={`w-full bg-[#379937] text-white font-bold py-3 px-4 rounded-lg text-base transition-all ${
                  loading || !isOnline
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#2d7e2d] active:scale-[0.98] shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>

              {/* DEMO LOGIN BUTTON */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading || !isOnline}
                className={`w-full bg-[#3b82f6] text-white font-bold py-3 px-4 rounded-lg text-base transition-all ${
                  loading || !isOnline
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#2563eb] active:scale-[0.98] shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Logging in..." : "Demo Login"}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className={`mt-6 text-sm text-center ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#379937] font-semibold hover:underline">
                Sign up
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;