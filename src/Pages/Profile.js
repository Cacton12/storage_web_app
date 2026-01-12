import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, User, Mail, Save, AlertCircle, CheckCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import apiClient from "../utils/apiClient";
import { getUserFriendlyMessage } from "../utils/apiErrorHandler";
import { validateFile } from "../utils/validation";

const Profile = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [user, setUser] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check token
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    setCheckingToken(false);
  }, [navigate]);

  // Load user and initial previews from sessionStorage
  useEffect(() => {
    if (checkingToken) return;
    
    try {
      const userData = sessionStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Use sessionStorage first, fallback to user object
        setBannerPreview(sessionStorage.getItem("bannerURL") || parsedUser.banner || null);
        setProfilePreview(sessionStorage.getItem("profileURL") || parsedUser.profileImage || null);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [checkingToken]);

  // File handlers
  const handleFileChange = (e, setFile, setPreview, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous errors
    setError("");

    // Validate file
    try {
      validateFile(file, {
        maxSize: type === "banner" ? 15 * 1024 * 1024 : 10 * 1024 * 1024, // 15MB for banner, 10MB for profile
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fieldName: type === "banner" ? "Banner image" : "Profile image"
      });

      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.onerror = () => setError("Failed to read image file");
      reader.readAsDataURL(file);
    } catch (validationError) {
      setError(validationError.message);
    }
  };

  const resetBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    sessionStorage.removeItem("bannerURL");
    setError("");
  };

  const resetProfile = () => {
    setProfileFile(null);
    setProfilePreview(null);
    sessionStorage.removeItem("profileURL");
    setError("");
  };

  // Compress image for sessionStorage if needed
  const compressImage = (fileOrDataUrl, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (typeof fileOrDataUrl === "string") {
        img.src = fileOrDataUrl;
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(fileOrDataUrl);
        reader.onload = (event) => (img.src = event.target.result);
        reader.onerror = (err) => reject(err);
      }
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        } else if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => reject(err);
    });
  };

  // Save handler
  const handleSave = async () => {
    if (!user?.email) {
      setError("User information is missing");
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    const isDemo = sessionStorage.getItem("isDemo") === "true";

    if (isDemo) {
      try {
        if (bannerPreview) {
          sessionStorage.setItem("bannerURL", bannerPreview);
        } else {
          sessionStorage.removeItem("bannerURL");
        }

        if (profilePreview) {
          try {
            sessionStorage.setItem("profileURL", profilePreview);
          } catch (err) {
            if (err.name === "QuotaExceededError") {
              const compressed = await compressImage(profilePreview);
              sessionStorage.setItem("profileURL", compressed);
            } else {
              throw err;
            }
          }
        } else {
          sessionStorage.removeItem("profileURL");
        }

        setSuccess("Profile updated successfully!");
        setTimeout(() => navigate("/main"), 1500);
      } catch (err) {
        console.error("Failed to save demo images:", err);
        setError("Failed to save images. Try a smaller profile picture.");
      } finally {
        setSaving(false);
      }
      return;
    }

    // Real API call
    const formData = new FormData();
    if (bannerFile) formData.append("bannerFile", bannerFile);
    else if (!bannerPreview) formData.append("removeBanner", "true");

    if (profileFile) formData.append("profileFile", profileFile);
    else if (!profilePreview) formData.append("removeProfile", "true");

    if (user?.name) formData.append("name", user.name);

    try {
      const data = await apiClient.uploadFile(
        `/api/user/update/${user.email}`,
        formData,
        (progress) => {
          // Optional: Update a progress bar here
          console.log(`Upload progress: ${progress}%`);
        }
      );

      if (data.success) {
        setUser(data.user);
        const profileUrl = data.profile?.profileUrl;
        const bannerUrl = data.banner?.bannerUrl;
        setProfilePreview(profileUrl);
        setBannerPreview(bannerUrl);
        setProfileFile(null);
        setBannerFile(null);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        if (profileUrl) sessionStorage.setItem("profileURL", profileUrl);
        if (bannerUrl) sessionStorage.setItem("bannerURL", bannerUrl);

        setSuccess("Profile updated successfully!");
        setTimeout(() => navigate("/main"), 1500);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(getUserFriendlyMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (checkingToken || loading) {
    return (
      <div className={`w-full h-screen flex items-center justify-center ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-neutral-300 border-t-[#379937] rounded-full"></div>
          <p className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>
      {/* Header */}
      <div className={`${theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white"} shadow-md border-b sticky top-0 z-40`}>
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
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        )}

        {/* Banner */}
        <section className={`relative w-full h-72 md:h-96 flex items-center justify-center overflow-hidden rounded-2xl ${bannerPreview ? "" : theme === "dark" ? "bg-neutral-800" : "bg-neutral-300"}`}>
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
                  onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview, "banner")}
                  disabled={saving}
                />
              </label>
              {(bannerPreview || bannerFile) && (
                <button 
                  onClick={resetBanner} 
                  className="bg-red-500/90 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold text-white"
                  disabled={saving}
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
                <label className="cursor-pointer">
                  <Upload className="w-8 h-8 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, setProfileFile, setProfilePreview, "profile")}
                    disabled={saving}
                  />
                </label>
              </div>
            </div>

            <div className="flex-1">
              <h2 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
                {user?.name || "User"}
              </h2>
              <p className={`text-lg mt-2 flex items-center gap-2 ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>
                <Mail className="w-5 h-5" /> {user?.email}
              </p>
            </div>

            {(profilePreview || profileFile) && (
              <button 
                onClick={resetProfile} 
                className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold text-white transition disabled:opacity-50"
                disabled={saving}
              >
                Reset Photo
              </button>
            )}
          </div>

          {/* Account Info */}
          <div className="px-8 py-8">
            <h3 className={`text-xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                  <User className="inline w-4 h-4 mr-2" /> Full Name
                </label>
                <div className={`px-4 py-3 rounded-lg border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"}`}>
                  {user?.name}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
                  <Mail className="inline w-4 h-4 mr-2" /> Email
                </label>
                <div className={`px-4 py-3 rounded-lg border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"}`}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-8 py-8 flex justify-center">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center gap-2 bg-[#379937] hover:bg-[#2d7e2d] text-white font-semibold py-3 px-6 rounded-lg transition-colors w-1/2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;