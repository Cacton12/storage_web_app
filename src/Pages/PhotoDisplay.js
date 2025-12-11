import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UploadCloud,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

import ProfileDropdown from "../Components/DropDownMenuComponent";
import UploadModal from "../Components/UploadModal";
import EditPhotoModal from "../Components/EditModal";
import FeedbackBanner from "../Components/FeedbackBanner";

export default function PhotoGallery() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [user, setUser] = useState(null);

  const [bannerImage, setBannerImage] = useState(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);

  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);

  // ------------------------------
  // Utility: Clean photo title
  // ------------------------------
  const cleanTitle = (fileName) => {
    let name = fileName.includes("_")
      ? fileName.split("_").slice(1).join("_")
      : fileName;
    name = name.replace(/\.[^/.]+$/, "");
    name = name.replace(/[_-]/g, " ");
    name = name.replace(/\b\w/g, (char) => char.toUpperCase());
    return name;
  };

  // ------------------------------
  // Fetch user photos
  // ------------------------------
  const fetchUserPhotos = useCallback(async (userId) => {
    try {
      const res = await fetch(`http://localhost:5219/api/images/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch images");

      const data = await res.json();
      if (!data.images || !Array.isArray(data.images))
        throw new Error("Invalid response format");

      setPhotos(
        data.images
          .map((photo) => ({
            id: photo.id,
            key: photo.photoKey,
            src: photo.url,
            title: cleanTitle(photo.title),
            desc: photo.desc || "Uploaded by you",
            dateCreated: photo.dateCreated,
          }))
          .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
      );
    } catch (err) {
      console.error("Error fetching photos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------
  // Handle edit save
  // ------------------------------
  const handleEditSave = async ({ title, desc }) => {
    if (!selectedPhoto || !user) return;

    try {
      const res = await fetch(`http://localhost:5219/api/edit/${selectedPhoto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserId: user.id, Title: title, Desc: desc }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update photo: ${text}`);
      }

      setPhotos((prev) =>
        prev.map((p) => (p.id === selectedPhoto.id ? { ...p, title, desc } : p))
      );
      setSelectedPhoto((prev) => ({ ...prev, title, desc }));
      setShowEditModal(false);
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to update photo. Check console for details.");
    }
  };

// ------------------------------
// Session check & fetch photos
// ------------------------------
useEffect(() => {
  const token = sessionStorage.getItem("token");
  const userData = JSON.parse(sessionStorage.getItem("user"));

  if (!token || !userData) {
    navigate("/", { replace: true });
    return;
  }

  setUser(userData);

  // Set banner
  setBannerImage(
    userData.banner
      ? userData.banner
      : theme === "dark"
      ? "/image (1).png"
      : "/image.png"
  );

  setChecking(false);
  fetchUserPhotos(userData.id);

  // Show feedback banner if redirected from feedback page
  const feedbackFlag = sessionStorage.getItem("feedbackSent");
  if (feedbackFlag === "true") {
    setShowFeedbackBanner(true);
    // Remove the flag after a short delay to avoid double-read issues in Strict Mode
    setTimeout(() => {
      sessionStorage.removeItem("feedbackSent");
    }, 50);
  }
}, [navigate, fetchUserPhotos, theme]);

  // ------------------------------
  // Keyboard navigation for lightbox
  // ------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      const index = photos.findIndex((p) => p.id === selectedPhoto.id);

      if (e.key === "Escape") setSelectedPhoto(null);
      if (e.key === "ArrowLeft")
        setSelectedPhoto(photos[(index - 1 + photos.length) % photos.length]);
      if (e.key === "ArrowRight")
        setSelectedPhoto(photos[(index + 1) % photos.length]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, photos]);

  // ------------------------------
  // Upload photo
  // ------------------------------
  const handleUpload = async () => {
    if (!uploadFile || !user) return;

    const formData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    formData.append("userId", user.id);
    formData.append("title", uploadTitle);
    formData.append("desc", uploadDesc);

    try {
      const res = await fetch("http://localhost:5219/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.photo) {
        const newPhoto = {
          id: data.photo.id,
          key: data.photo.photoKey,
          src: data.photo.url,
          title: cleanTitle(data.photo.title) || `Photo ${photos.length + 1}`,
          desc: data.photo.desc || "Uploaded by you",
          dateCreated: data.photo.dateCreated,
        };

        setPhotos((prev) =>
          [newPhoto, ...prev].sort(
            (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
          )
        );

        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle("");
        setUploadDesc("");
      } else {
        console.error("Upload failed:", data);
        alert("Upload failed, please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error, check console for details.");
    }
  };

  // ------------------------------
  // Delete photo
  // ------------------------------
  const handleDelete = async () => {
    if (!selectedPhoto || !user) return;

    try {
      const { id: photoId, key: photoKey } = selectedPhoto;
      const encodedKey = encodeURIComponent(photoKey);

      const res = await fetch(
        `http://localhost:5219/api/delete?userId=${user.id}&photoId=${photoId}&photoKey=${encodedKey}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete photo. Check console for details.");
    }
  };

  // ------------------------------
  // Loading screen
  // ------------------------------
  if (checking || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-neutral-300 border-t-[#379937] rounded-full"></div>
          <p className="text-neutral-600 dark:text-neutral-300">
            Loading your gallery...
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------
  // Main return
  // ------------------------------
  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>
      {/* Feedback Banner */}
  <AnimatePresence>
    {showFeedbackBanner ? (
      <FeedbackBanner
        key="feedback-banner" // important for AnimatePresence to animate properly
        message="Thanks for your feedback!"
        duration={4000}
        onClose={() => setShowFeedbackBanner(false)}
      />
    ) : null}
  </AnimatePresence>

      {/* Header */}
      <header
        className={`w-full px-6 py-4 ${theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white"} shadow-md flex justify-between items-center sticky top-0 z-50 border-b`}
      >
        <h1 className="text-3xl font-bold text-[#379937]">MyGallery</h1>
        <div
          className={`hidden md:flex items-center ${theme === "dark" ? "bg-neutral-800" : "bg-neutral-200"} px-4 py-2 rounded-xl w-96`}
        >
          <Search className="w-5 h-5 text-neutral-600" />
          <input
            type="text"
            placeholder="Search your photos..."
            className={`ml-3 bg-transparent focus:outline-none w-full ${theme === "dark" ? "text-white placeholder-neutral-400" : "text-neutral-800"}`}
          />
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-[#379937] text-white font-semibold shadow-md flex items-center gap-2"
          >
            <UploadCloud className="w-5 h-5" /> Upload
          </button>
          <ProfileDropdown profileImage={user?.profileImage || null} />
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-72 md:h-96 overflow-hidden flex items-center justify-center">
        {bannerImage === "/image.png" || bannerImage === "/image (1).png" ? (
          <div className={`w-full h-full flex flex-col items-center justify-center ${theme === "dark" ? "bg-neutral-800" : "bg-neutral-300"}`}>
            <div className={`flex items-center justify-center w-24 h-24 rounded-full ${theme === "dark" ? "bg-neutral-900" : "bg-neutral-400"}`}>
              <svg
                className="w-12 h-12"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke={theme === "dark" ? "#a3a3a3" : "#ffffff"}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
              </svg>
            </div>
            <p className={`mt-4 text-center text-lg md:text-xl ${theme === "dark" ? "text-neutral-300" : "text-neutral-900"}`}>
              No custom banner set. Go to your profile to upload one!
            </p>
          </div>
        ) : (
          <>
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white">{user?.name ? `${user.name}'s Memories.` : "Your Memories. Organized Beautifully."}</h2>
              <p className="text-white text-lg md:text-xl mt-4 max-w-2xl">A clean and immersive way to store and view your photos.</p>
            </div>
          </>
        )}
      </section>

      {/* Masonry Grid */}
      <main className="p-6">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-5">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              whileHover={{ scale: 1.02 }}
              className={`mb-5 break-inside-avoid rounded-2xl overflow-hidden shadow-lg ${theme === "dark" ? "bg-neutral-800" : "bg-white"} hover:shadow-xl transition cursor-pointer`}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo.src} alt={photo.title} className="w-full h-auto object-cover" loading="lazy" />
              <div className="p-4">
                <p className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>{photo.title}</p>
                <p className={`text-sm ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"} mt-1`}>{photo.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Lightbox & Edit/Delete buttons */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className={`relative rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col ${
                theme === "dark" ? "bg-neutral-900" : "bg-neutral-100"
              }`}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`flex-1 flex items-center justify-center overflow-hidden ${
                  theme === "dark" ? "bg-neutral-900" : "bg-neutral-300"
                }`}
              >
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div
                className={`px-6 py-4 border-t ${
                  theme === "dark"
                    ? "bg-neutral-800 border-neutral-700"
                    : "bg-neutral-100 border-neutral-200"
                }`}
              >
                <h3
                  className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {selectedPhoto.title}
                </h3>
                <p
                  className={`${
                    theme === "dark" ? "text-neutral-300" : "text-neutral-600"
                  } mt-2`}
                >
                  {selectedPhoto.desc}
                </p>
              </div>

              <button
                className={`absolute top-4 right-4 p-3 rounded-full ${
                  theme === "dark"
                    ? "bg-black/60 hover:bg-black/80"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                onClick={() => setSelectedPhoto(null)}
              >
                <X
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                />
              </button>

              <button
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${
                  theme === "dark"
                    ? "bg-black/60 hover:bg-black/80"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                onClick={() => {
                  const idx = photos.findIndex(
                    (p) => p.id === selectedPhoto.id
                  );
                  setSelectedPhoto(
                    photos[(idx - 1 + photos.length) % photos.length]
                  );
                }}
              >
                <ChevronLeft
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                />
              </button>

              <button
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${
                  theme === "dark"
                    ? "bg-black/60 hover:bg-black/80"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                onClick={() => {
                  const idx = photos.findIndex(
                    (p) => p.id === selectedPhoto.id
                  );
                  setSelectedPhoto(photos[(idx + 1) % photos.length]);
                }}
              >
                <ChevronRight
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                />
              </button>

              <button
                className="absolute bottom-4 right-32 px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                onClick={() => setShowEditModal(true)}
              >
                Edit
              </button>

              <button
                className="absolute bottom-4 right-4 px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                onClick={handleDelete}
              >
                Delete
              </button>

              <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold ${
                  theme === "dark"
                    ? "bg-black/60 text-neutral-100"
                    : "bg-white/60 text-neutral-900"
                }`}
              >
                {photos.findIndex((p) => p.id === selectedPhoto.id) + 1} /{" "}
                {photos.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <UploadModal
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        theme={theme}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        uploadTitle={uploadTitle}
        setUploadTitle={setUploadTitle}
        uploadDesc={uploadDesc}
        setUploadDesc={setUploadDesc}
        handleUpload={handleUpload}
      />

      {/* Edit Modal */}
      <EditPhotoModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        photo={selectedPhoto}
        onSave={handleEditSave}
      />

      {/* Footer */}
      <footer
        className={`w-full py-6 mt-10 text-center ${
          theme === "dark" ? "text-neutral-500" : "text-neutral-600"
        }`}
      >
        © 2025 MyGallery • Built with ❤️ by You
      </footer>
    </div>
  );
}
