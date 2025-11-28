import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, User, Mail } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [bannerImage, setBannerImage] = useState(
    localStorage.getItem("userBanner") || "/images/Valley.jpg"
  );
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("userProfileImage") || "/images/SomeDude.jpg"
  );
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

  // TOKEN CHECK
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    setChecking(false);
  }, [navigate]);

  // LOAD USER DATA
  useEffect(() => {
    if (checking) return;
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [checking]);

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result);
        localStorage.setItem("userBanner", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem("userProfileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetBanner = () => {
    setBannerImage("/images/Valley.jpg");
    localStorage.setItem("userBanner", "/images/Valley.jpg");
  };

  const resetProfileImage = () => {
    setProfileImage("/images/SomeDude.jpg");
    localStorage.setItem("userProfileImage", "/images/SomeDude.jpg");
  };

  if (checking || loading) {
    return (
      <div
        className={`w-full h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-neutral-300 border-t-[#379937] rounded-full"></div>
          <p className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"
      }`}
    >
      {/* Header with Back Button */}
      <div
        className={`${
          theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white"
        } shadow-md border-b sticky top-0 z-40`}
      >
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/main")}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-neutral-800 text-neutral-400"
                : "hover:bg-neutral-100 text-neutral-600"
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-neutral-900"
            }`}
          >
            My Profile
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Banner Section */}
        <div className="mb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-xl h-80 bg-neutral-200 dark:bg-neutral-800 group">
            <img
              src={bannerImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-4">
                <label className="cursor-pointer bg-white/90 hover:bg-white px-6 py-3 rounded-lg font-semibold text-neutral-900 transition-colors flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Change Banner
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={resetBanner}
                  className="bg-red-500/90 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <p
            className={`text-sm mt-3 ${
              theme === "dark" ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            Hover over the banner to upload a new image
          </p>
        </div>

        {/* Profile Card */}
        <div
          className={`rounded-3xl shadow-xl overflow-hidden ${
            theme === "dark" ? "bg-neutral-900" : "bg-white"
          }`}
        >
          {/* Profile Image Section */}
          <div className="px-8 py-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#379937] shadow-lg">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex-1">
                <h2
                  className={`text-3xl font-bold ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {user?.name || "User"}
                </h2>
                <p
                  className={`text-lg mt-2 flex items-center gap-2 ${
                    theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  {user?.email}
                </p>
              </div>

              <button
                onClick={resetProfileImage}
                className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold text-white transition-colors"
              >
                Reset Photo
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="px-8 py-8">
            <h3
              className={`text-xl font-bold mb-6 ${
                theme === "dark" ? "text-white" : "text-neutral-900"
              }`}
            >
              Account Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  <User className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <div
                  className={`px-4 py-3 rounded-lg border ${
                    theme === "dark"
                      ? "bg-neutral-800 border-neutral-700 text-neutral-200"
                      : "bg-neutral-50 border-neutral-200 text-neutral-900"
                  }`}
                >
                  {user?.name}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <div
                  className={`px-4 py-3 rounded-lg border ${
                    theme === "dark"
                      ? "bg-neutral-800 border-neutral-700 text-neutral-200"
                      : "bg-neutral-50 border-neutral-200 text-neutral-900"
                  }`}
                >
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-8 py-8 border-t border-neutral-200 dark:border-neutral-800 flex gap-4">
            <button
              onClick={() => navigate("/main")}
              className="flex-1 bg-[#379937] hover:bg-[#2d7e2d] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Gallery
            </button>
            <button
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  : "bg-neutral-200 hover:bg-neutral-300 text-neutral-900"
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
