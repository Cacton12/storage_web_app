import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, User, Mail, Save } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [user, setUser] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);

  // Check token
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    setCheckingToken(false);
  }, [navigate]);

  // Load user
  useEffect(() => {
    if (checkingToken) return;
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setBannerPreview(parsedUser.banner || null);
      setProfilePreview(parsedUser.profileImage || null);
    }
    setLoading(false);
  }, [checkingToken]);

  // File upload handlers
  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Reset handlers
  const resetBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const resetProfile = () => {
    setProfileFile(null);
    setProfilePreview(null);
  };

  // Save changes
  const handleSave = async () => {
    if (!user?.email) return;

    const formData = new FormData();

    // Banner
    if (bannerFile) formData.append("bannerFile", bannerFile);
    else if (bannerPreview === null) formData.append("removeBanner", "true");

    // Profile
    if (profileFile) formData.append("profileFile", profileFile);
    else if (profilePreview === null) formData.append("removeProfile", "true");

    // Name
    if (user?.name) formData.append("name", user.name);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5219/api/user/update/${user.email}`,
        {
          method: "PATCH",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setBannerPreview(data.user.banner || null);
        setProfilePreview(data.user.profileImage || null);
        setBannerFile(null);
        setProfileFile(null);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        navigate("/main");
      } else {
        alert("Failed to update profile: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred while updating profile");
    }
  };

  if (checkingToken || loading) {
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
    <div className={`min-h-screen ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>
      {/* Header */}
      <div
        className={`${theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white"} shadow-md border-b sticky top-0 z-40`}
      >
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/main")}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark" ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-600"
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Banner */}
        <section
          className={`relative w-full h-72 md:h-96 flex items-center justify-center overflow-hidden rounded-2xl ${
            bannerPreview ? "" : theme === "dark" ? "bg-neutral-800" : "bg-neutral-300"
          }`}
        >
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-neutral-500">Upload a banner</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
            <div className="flex gap-4">
              <label className="cursor-pointer bg-white/90 hover:bg-white px-6 py-3 rounded-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Upload className="w-5 h-5" /> Change Banner
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview)}
                />
              </label>
              {(bannerPreview || bannerFile) && (
                <button
                  onClick={resetBanner}
                  className="bg-red-500/90 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold text-white"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Profile Card */}
        <div className={`rounded-3xl shadow-xl overflow-hidden mt-8 ${theme === "dark" ? "bg-neutral-900" : "bg-white"}`}>
          <div className="px-8 py-8 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#379937] shadow-lg">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme === "dark" ? "bg-neutral-700" : "bg-neutral-300"} rounded-full`}>
                    <User className="w-16 h-16 text-neutral-500" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <label>
                  <Upload className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setProfileFile, setProfilePreview)}
                  />
                </label>
              </div>
            </div>

            <div className="flex-1">
              <h2 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>{user?.name || "User"}</h2>
              <p className={`text-lg mt-2 flex items-center gap-2 ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
                <Mail className="w-5 h-5" /> {user?.email}
              </p>
            </div>

            {(profilePreview || profileFile) && (
              <button
                onClick={resetProfile}
                className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold text-white"
              >
                Reset Photo
              </button>
            )}
          </div>

          {/* Account Info */}
          <div className="px-8 py-8">
            <h3 className={`text-xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                  <User className="inline w-4 h-4 mr-2" /> Full Name
                </label>
                <div className={`px-4 py-3 rounded-lg border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"}`}>{user?.name}</div>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                  <Mail className="inline w-4 h-4 mr-2" /> Email
                </label>
                <div className={`px-4 py-3 rounded-lg border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"}`}>{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-8 py-8 flex justify-center">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#379937] hover:bg-[#2d7e2d] text-white font-semibold py-3 px-6 rounded-lg transition-colors w-1/2 justify-center"
            >
              <Save className="w-5 h-5" /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
