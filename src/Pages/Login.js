import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = sessionStorage.getItem("token");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      navigate("/main", { replace: true });
    } else {
      setChecking(false);
    }
  }, [navigate]);

  if (checking) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await fetch("https://api-proxy.colbyacton12.workers.dev/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save JWT + user info
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful!");
      navigate("/main");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Inside your Login component, add this function
  const handleDemoLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Hardcoded demo credentials
      const demoCredentials = {
        email: "demo@demo.com",
        password: "demo",
      };

      const response = await fetch("https://api-proxy.colbyacton12.workers.dev/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoCredentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Demo login failed");
        setLoading(false);
        return;
      }

      // Save JWT + user info
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      // Store as a boolean
      sessionStorage.setItem("isDemo", JSON.stringify(true));

      setSuccess("Demo login successful!");
      navigate("/main");
    } catch (err) {
      setError("Something went wrong with demo login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-screen w-full flex flex-col md:flex-row ${
        theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"
      }`}
    >
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-neutral-200 dark:bg-neutral-800 hover:scale-110 transition-transform"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-neutral-100" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400" />
        )}
      </button>
      {/* Left side */}
      <div
        className="h-1/2 md:h-full w-full md:w-1/2 flex flex-col justify-center items-center text-center p-10"
        style={{
          backgroundImage: `url('/images/Valley.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 mb-6">
          Welcome Back!
        </h1>
        <p className="pb-20 text-lg md:text-2xl text-neutral-800 max-w-md">
          Log in to securely access your photo collection.
        </p>
      </div>

      {/* Right side - Login */}
      <div
        className={`h-full md:w-1/2 ${
          theme === "dark" ? "bg-neutral-900" : "bg-[#f8f8f3]"
        } flex justify-center items-center`}
      >
        <form className="w-3/4 max-w-md p-8" onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold text-[#51803e] mb-6 text-center">
            Log into your account
          </h2>

          {/* ERROR MESSAGE */}
          {error && <p className="text-red-500 text-center mb-3">{error}</p>}

          {/* SUCCESS MESSAGE */}
          {success && (
            <p className="text-green-600 text-center mb-3">{success}</p>
          )}

          <div className="mb-4">
            <label
              className={`block mb-2 ${
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 rounded-md border focus:ring-2 focus:ring-[#51803e] ${
                theme === "dark"
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                  : "bg-[#fcfdfb] border-[#9ca3af]"
              }`}
            />
          </div>

          <div className="mb-4">
            <label
              className={`block mb-2 ${
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={`w-full px-4 py-2 rounded-md border focus:ring-2 focus:ring-[#51803e] ${
                theme === "dark"
                  ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                  : "bg-[#fcfdfb] border-[#9ca3af]"
              }`}
            />
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#379937] text-white font-bold py-2 px-4 rounded-lg transition-all 
             ${
               loading
                 ? "opacity-50 cursor-not-allowed"
                 : "hover:bg-[#2d7e2d] active:scale-95"
             }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className={`w-full mt-3 bg-[#3b82f6] text-white font-bold py-2 px-4 rounded-lg transition-all
            ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#2563eb] active:scale-95"
            }`}
          >
            {loading ? "Logging in..." : "Demo Login"}
          </button>

          <p className="pt-3 text-center">
            Don't have an account?
            <Link to="/signup" className="text-[#379937] px-1 font-semibold">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
