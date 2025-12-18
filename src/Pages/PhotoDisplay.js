import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import FeedbackBanner from "../Components/FeedbackBanner";
import ProfileDropdown from "../Components/DropDownMenuComponent";
import UploadModal from "../Components/UploadModal";
import EditPhotoModal from "../Components/EditModal";
import { useLocation } from "react-router-dom";

export const demoPhotosArray = [
  {
    id: 1,
    key: "demo1.jpg",
    src: "/images/BridgeWaterFall.jpg",
    title: "Demo Photo 1",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 2,
    key: "demo2.jpg",
    src: "/images/FoggyTrees.jpg",
    title: "Demo Photo 2",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
    {
    id: 3,
    key: "demo3.jpg",
    src: "/images/FlowerMountains.jpg",
    title: "Demo Photo 3",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
    {
    id: 4,
    key: "demo4.jpg",
    src: "/images/Valley.jpg",
    title: "Demo Photo 4",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
    {
    id: 5,
    key: "demo5.jpg",
    src: "/images/SomeDude.jpg",
    title: "Demo Photo 5",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
    {
    id: 6,
    key: "demo6.jpg",
    src: "/images/MountiansDeer.jpg",
    title: "Demo Photo 6",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
    {
    id: 7,
    key: "demo7.jpg",
    src: "/images/lumber-84678.webp",
    title: "Demo Photo 7",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
    {
    id: 8,
    key: "demo8.jpg",
    src: "/images/forestry-6596153.webp",
    title: "Demo Photo 8",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  // Add more as needed
];

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
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  const isDemo = JSON.parse(sessionStorage.getItem("isDemo")) || false;
  const location = useLocation();

//Demo Mode State
useEffect(() => {
  const demoFlag = JSON.parse(sessionStorage.getItem("isDemo")) || false;
  setIsDemoMode(demoFlag);
}, []);

//Feedback Banner
useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("feedbackSent") === "true") {
    setShowFeedbackBanner(true);
    window.history.replaceState({}, document.title, "/main");
  }
}, [location]);

//make the default title cleaner
  const cleanTitle = (fileName) => {
    let name = fileName.includes("_") ? fileName.split("_").slice(1).join("_") : fileName;
    name = name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    return name.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  //fetch all the users photos 
  const fetchUserPhotos = useCallback(async (userId) => {
    try {
      const res = await fetch(`api-proxy.colbyacton12.workers.dev/api/images/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      if (!data.images || !Array.isArray(data.images)) throw new Error("Invalid response format");
      return data.images
        .map((photo) => ({
          id: photo.id,
          key: photo.photoKey,
          src: photo.url,
          title: cleanTitle(photo.title),
          desc: photo.desc || "Uploaded by you",
          dateCreated: photo.dateCreated,
        }))
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    } catch (err) {
      console.error("Error fetching photos:", err);
      return [];
    }
  }, []);

  // ------------------------------
  // Initialize session and photos
  // ------------------------------
useEffect(() => {
  const token = sessionStorage.getItem("token");
  const userData = JSON.parse(sessionStorage.getItem("user"));
  if (!token || !userData) return navigate("/", { replace: true });

  setUser(userData);
  setBannerImage(userData.banner || (theme === "dark" ? "/image (1).png" : "/image.png"));
  setChecking(false);

  if (isDemo) {
    console.log("Loading demo photos from localStorage");
    const stored = localStorage.getItem("demoPhotos");
    let photosToLoad = demoPhotosArray;

    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("Demo photos found in localStorage");

        // Filter out blob URLs
        photosToLoad = parsed.filter(photo => !photo.src.startsWith("blob:"));

        // Optional: if all were blobs, fallback to defaults
        if (photosToLoad.length === 0) {
          console.log("All localStorage photos were invalid, using defaults");
          photosToLoad = demoPhotosArray;
          localStorage.setItem("demoPhotos", JSON.stringify(demoPhotosArray));
        }

      } else {
        console.log("LocalStorage demoPhotos empty, using defaults");
        localStorage.setItem("demoPhotos", JSON.stringify(demoPhotosArray));
      }
    } else {
      console.log("No demo photos in localStorage, initializing with defaults");
      localStorage.setItem("demoPhotos", JSON.stringify(demoPhotosArray));
    }

    setPhotos(photosToLoad);
    setLoading(false);
  } else {
    fetchUserPhotos(userData.id).then((fetched) => {
      setPhotos(fetched);
      setLoading(false);
    });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [navigate, fetchUserPhotos, theme, isDemo]);

  // ------------------------------
  // Upload Photo
  // ------------------------------
const handleUpload = () => {
  if (!uploadFile) return;

  if (isDemo) {
    const reader = new FileReader();
    const img = new Image();

    // Step 1: Read the file as base64
    reader.onload = (e) => {
      img.src = e.target.result;

      img.onload = () => {
        // Step 2: Resize image if wider than MAX_WIDTH
        const MAX_WIDTH = 800; // max width in pixels
        const scale = Math.min(MAX_WIDTH / img.width, 1);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Step 3: Compress the image
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); // 70% quality

        // Step 4: Create new photo object
        const newPhoto = {
          id: Date.now(),
          key: uploadFile.name,
          src: compressedBase64,
          title: uploadTitle || `Photo ${photos.length + 1}`,
          desc: uploadDesc || "Uploaded by demo user",
          dateCreated: new Date().toISOString(),
        };

        // Step 5: Update state and localStorage
        const updated = [newPhoto, ...photos];
        setPhotos(updated);

        try {
          localStorage.setItem("demoPhotos", JSON.stringify(updated));
        } catch (e) {
          console.error("LocalStorage quota exceeded", e);
        }

        // Step 6: Reset upload form
        setUploadFile(null);
        setUploadTitle("");
        setUploadDesc("");
        setShowUploadModal(false);
      };
    };

    reader.readAsDataURL(uploadFile); // trigger reading
    return;
  }

  // --- Real upload mode unchanged ---
  const formData = new FormData();
  formData.append("file", uploadFile, uploadFile.name);
  formData.append("userId", user.id);
  formData.append("title", uploadTitle);
  formData.append("desc", uploadDesc);

  fetch("https://api-proxy.colbyacton12.workers.dev/api/upload/image", { method: "POST", body: formData })
    .then((res) => res.json())
    .then((data) => {
      if (!data.photo) throw new Error("Upload failed");
      const newPhoto = {
        id: data.photo.id,
        key: data.photo.photoKey,
        src: data.photo.url,
        title: cleanTitle(data.photo.title),
        desc: data.photo.desc || "Uploaded by you",
        dateCreated: data.photo.dateCreated,
      };
      setPhotos((prev) => [newPhoto, ...prev]);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDesc("");
      setShowUploadModal(false);
    })
    .catch((err) => {
      console.error(err);
      alert("Upload failed");
    });
};



  // ------------------------------
  // Edit Photo
  // ------------------------------
  const handleEditSave = ({ title, desc }) => {
    if (!selectedPhoto) return;

    if (isDemo) {
      const updated = photos.map((p) => (p.id === selectedPhoto.id ? { ...p, title, desc } : p));
      setPhotos(updated);
      setSelectedPhoto({ ...selectedPhoto, title, desc });
      localStorage.setItem("demoPhotos", JSON.stringify(updated));
      setShowEditModal(false);
      return;
    }

    fetch(`https://api-proxy.colbyacton12.workers.dev/api/edit/${selectedPhoto.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserId: user.id, Title: title, Desc: desc }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Edit failed");
        const updated = photos.map((p) => (p.id === selectedPhoto.id ? { ...p, title, desc } : p));
        setPhotos(updated);
        setSelectedPhoto({ ...selectedPhoto, title, desc });
        setShowEditModal(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to edit photo");
      });
  };

  // ------------------------------
  // Delete Photo
  // ------------------------------
  const handleDelete = () => {
    if (!selectedPhoto) return;

    if (isDemo) {
      const updated = photos.filter((p) => p.id !== selectedPhoto.id);
      setPhotos(updated);
      setSelectedPhoto(null);
      localStorage.setItem("demoPhotos", JSON.stringify(updated));
      return;
    }

    const { id: photoId, key: photoKey } = selectedPhoto;
    const encodedKey = encodeURIComponent(photoKey);
    fetch(`https://api-proxy.colbyacton12.workers.dev/api/delete?userId=${user.id}&photoId=${photoId}&photoKey=${encodedKey}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        const updated = photos.filter((p) => p.id !== photoId);
        setPhotos(updated);
        setSelectedPhoto(null);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to delete photo");
      });
  };

  // ------------------------------
  // Lightbox navigation
  // ------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      const idx = photos.findIndex((p) => p.id === selectedPhoto.id);
      if (e.key === "Escape") setSelectedPhoto(null);
      if (e.key === "ArrowLeft") setSelectedPhoto(photos[(idx - 1 + photos.length) % photos.length]);
      if (e.key === "ArrowRight") setSelectedPhoto(photos[(idx + 1) % photos.length]);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, photos]);

  // ------------------------------
  // Loading
  // ------------------------------
  if (checking || loading)
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-neutral-300 border-t-[#379937] rounded-full"></div>
          <p className="text-neutral-600 dark:text-neutral-300">Loading your gallery...</p>
        </div>
      </div>
    );

  // ------------------------------
  // Main return
  // ------------------------------
return (
  <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>

{/* Demo Mode Banner */}
{isDemoMode && showDemoBanner && (
  <div
    className={`w-full py-2 px-4 flex justify-center items-center text-sm font-semibold ${
      theme === "dark" ? "bg-yellow-600 text-neutral-900" : "bg-yellow-300 text-neutral-900"
    }`}
  >
    <span>⚠️ You are in Demo Mode — all changes will not be saved.</span>
    <button
      onClick={() => setShowDemoBanner(false)}
      className="ml-4 font-bold hover:text-neutral-700"
    >
      ✕
    </button>
  </div>
)}

    {/* Header */}
    <header
      className={`w-full px-6 py-4 ${theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white"} shadow-md flex justify-between items-center sticky top-0 z-50 border-b`}
    >
      <h1 className="text-3xl font-bold text-[#379937]">MyGallery</h1>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 rounded-xl bg-[#379937] text-white font-semibold shadow-md flex items-center gap-2"
        >
          <UploadCloud className="w-5 h-5" /> Upload
        </button>
        <ProfileDropdown
            profileImage={localStorage.getItem("demoProfileImage") || user?.profileImage || null}
          />
      </div>
    </header>

    {/* Hero Banner */}
    <section className="relative h-72 md:h-96 overflow-hidden flex items-center justify-center">
      {bannerImage?.includes("image") ? (
        <div className={`w-full h-full flex flex-col items-center justify-center ${theme === "dark" ? "bg-neutral-800" : "bg-neutral-300"}`}>
          <div className={`flex items-center justify-center w-24 h-24 rounded-full ${theme === "dark" ? "bg-neutral-900" : "bg-neutral-400"}`}>
            {/* Default Banner Icon */}
            <svg className="w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={theme === "dark" ? "#a3a3a3" : "#ffffff"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
            </svg>
          </div>
          <p className={`mt-4 text-center text-lg md:text-xl ${theme === "dark" ? "text-neutral-300" : "text-neutral-900"}`}>
            No custom banner set. Go to your profile to upload one!
          </p>
        </div>
      ) : (
        <>
          <img src={localStorage.getItem("demoBanner") || bannerImage} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6">
            <h2 className="text-4xl md:text-6xl font-bold text-white">
              {user?.name ? `${user.name}'s Memories` : "Your Memories. Organized Beautifully."}
            </h2>
            <p className="text-white text-lg md:text-xl mt-4 max-w-2xl">
              A clean and immersive way to store and view your photos.
            </p>
          </div>
        </>
      )}
    </section>

    {/* Feedback Banner */}
    <FeedbackBanner
      message="Thanks for your feedback!"
      show={showFeedbackBanner}
      onClose={() => setShowFeedbackBanner(false)}
      autoHide={4000}
    />

    {/* Masonry Grid */}
    <main className="p-6">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-5">
        {photos.length ? (
          photos.map((photo) => (
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
                <p className={`text-sm mt-1 ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>{photo.desc}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className={`text-center col-span-full ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"}`}>No photos yet. Upload your first memory!</p>
        )}
      </div>
    </main>

    {/* Lightbox & Edit/Delete */}
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
            className={`relative rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col ${theme === "dark" ? "bg-neutral-900" : "bg-neutral-100"}`}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex-1 flex items-center justify-center overflow-hidden ${theme === "dark" ? "bg-neutral-900" : "bg-neutral-300"}`}>
              <img src={selectedPhoto.src} alt={selectedPhoto.title} className="max-w-full max-h-full object-contain" />
            </div>

            <div className={`px-6 py-4 border-t ${theme === "dark" ? "bg-neutral-800 border-neutral-700" : "bg-neutral-100 border-neutral-200"}`}>
              <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>{selectedPhoto.title}</h3>
              <p className={`mt-2 ${theme === "dark" ? "text-neutral-300" : "text-neutral-600"}`}>{selectedPhoto.desc}</p>
            </div>

            {/* Close Button */}
            <button className={`absolute top-4 right-4 p-3 rounded-full ${theme === "dark" ? "bg-black/60 hover:bg-black/80" : "bg-white/60 hover:bg-white/80"}`} onClick={() => setSelectedPhoto(null)}>
              <X className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-neutral-900"}`} />
            </button>

            {/* Navigation */}
            <button className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${theme === "dark" ? "bg-black/60 hover:bg-black/80" : "bg-white/60 hover:bg-white/80"}`} onClick={() => {
              const idx = photos.findIndex(p => p.id === selectedPhoto.id);
              setSelectedPhoto(photos[(idx - 1 + photos.length) % photos.length]);
            }}>
              <ChevronLeft className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-neutral-900"}`} />
            </button>

            <button className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${theme === "dark" ? "bg-black/60 hover:bg-black/80" : "bg-white/60 hover:bg-white/80"}`} onClick={() => {
              const idx = photos.findIndex(p => p.id === selectedPhoto.id);
              setSelectedPhoto(photos[(idx + 1) % photos.length]);
            }}>
              <ChevronRight className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-neutral-900"}`} />
            </button>

            {/* Edit/Delete Buttons */}
            <button className="absolute bottom-4 right-32 px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" onClick={() => setShowEditModal(true)}>Edit</button>
            <button className="absolute bottom-4 right-4 px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition" onClick={handleDelete}>Delete</button>

            {/* Photo Index */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-semibold ${theme === "dark" ? "bg-black/60 text-neutral-100" : "bg-white/60 text-neutral-900"}`}>
              {photos.findIndex(p => p.id === selectedPhoto.id) + 1} / {photos.length}
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
    <EditPhotoModal show={showEditModal} onClose={() => setShowEditModal(false)} photo={selectedPhoto} onSave={handleEditSave} />

    {/* Footer */}
    <footer className={`w-full py-6 mt-10 text-center ${theme === "dark" ? "text-neutral-500" : "text-neutral-600"}`}>
      © 2025 MyGallery • Built with ❤️ by Colby Acton
    </footer>
  </div>
);
}