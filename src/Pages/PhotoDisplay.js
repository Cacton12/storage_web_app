import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import FeedbackBanner from "../Components/FeedbackBanner";
import ProfileDropdown from "../Components/DropDownMenuComponent";
import UploadModal from "../Components/UploadModal";
import EditPhotoModal from "../Components/EditModal";
import apiClient from "../utils/apiClient";
import { getUserFriendlyMessage } from "../utils/apiErrorHandler";
import { validateFile } from "../utils/validation";

// Image cache for current session
const imageCache = new Map();
const failedImages = new Set();

export const demoPhotosArray = [
  {
    id: 1,
    key: "demo1.jpg",
    src: "/images/BridgeWaterFall.jpg",
    title: "BridgeWaterFall",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 2,
    key: "demo2.jpg",
    src: "/images/FoggyTrees.jpg",
    title: "FoggyTrees",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 3,
    key: "demo3.jpg",
    src: "/images/FlowerMountains.jpg",
    title: "FlowerMountains",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 4,
    key: "demo4.jpg",
    src: "/images/Valley.jpg",
    title: "Valley",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 5,
    key: "demo5.jpg",
    src: "/images/SomeDude.jpg",
    title: "SomeDude",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 6,
    key: "demo6.jpg",
    src: "/images/MountiansDeer.jpg",
    title: "MountiansDeer",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 7,
    key: "demo7.jpg",
    src: "/images/lumber-84678.webp",
    title: "lumber",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 8,
    key: "demo8.jpg",
    src: "/images/forestry-6596153.webp",
    title: "forestry",
    desc: "Uploaded by demo user",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 13,
    key: "demo13.jpg",
    src: "/images/max-saeling-ef0sXQtnCYU-unsplash.jpg",
    title: "Mountain Landscape",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 14,
    key: "demo14.jpg",
    src: "/images/willian-justen-de-vasconcellos-T_Qe4QlMIvQ-unsplash.jpg",
    title: "Forest Road",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 15,
    key: "demo15.jpg",
    src: "/images/hendrik-cornelissen--qrcOR33ErA-unsplash.jpg",
    title: "Mountain Peaks",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 16,
    key: "demo16.jpg",
    src: "/images/mourad-saadi-GyDktTa0Nmw-unsplash.jpg",
    title: "Desert Landscape",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 17,
    key: "demo17.jpg",
    src: "/images/tim-swaan-eOpewngf68w-unsplash.jpg",
    title: "Snowy Mountains",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 18,
    key: "demo18.jpg",
    src: "/images/daniela-kokina-hOhlYhAiizc-unsplash.jpg",
    title: "Autumn Forest",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 19,
    key: "demo19.jpg",
    src: "/images/lukasz-szmigiel-jFCViYFYcus-unsplash.jpg",
    title: "Rocky Mountains",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 20,
    key: "demo20.jpg",
    src: "/images/tom-barrett-hgGplX3PFBg-unsplash.jpg",
    title: "Mountain Valley",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 21,
    key: "demo21.jpg",
    src: "/images/adam-kool-ndN00KmbJ1c-unsplash.jpg",
    title: "Road Through Mountains",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 22,
    key: "demo22.jpg",
    src: "/images/matthew-smith-Rfflri94rs8-unsplash.jpg",
    title: "Forest Trail",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 23,
    key: "demo23.jpg",
    src: "/images/v2osk-1Z2niiBPg5A-unsplash.jpg",
    title: "Misty Mountains",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
  {
    id: 24,
    key: "demo24.jpg",
    src: "/images/jeremy-bishop-EwKXn5CapA4-unsplash.jpg",
    title: "Coastal Cliffs",
    desc: "Unsplash demo photo",
    dateCreated: new Date().toISOString(),
  },
];

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// Optimized Image Component with error handling and loading state
const OptimizedImage = ({
  src,
  alt,
  className,
  onClick,
  loading = "lazy",
  priority = false,
}) => {
  const [imageState, setImageState] = useState({
    loaded: false,
    error: false,
    currentSrc: null,
  });
  const imgRef = useRef(null);

  useEffect(() => {
    // Check if image failed before
    if (failedImages.has(src)) {
      setImageState({ loaded: true, error: true, currentSrc: null });
      return;
    }

    // Check cache first
    if (imageCache.has(src)) {
      setImageState({
        loaded: true,
        error: false,
        currentSrc: imageCache.get(src),
      });
      return;
    }

    // Load image
    const img = new Image();
    img.src = src;

    img.onload = () => {
      imageCache.set(src, src);
      setImageState({ loaded: true, error: false, currentSrc: src });
    };

    img.onerror = () => {
      failedImages.add(src);
      setImageState({ loaded: true, error: true, currentSrc: null });
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (imageState.error) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-neutral-200 dark:bg-neutral-800`}
      >
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!imageState.loaded && (
        <div
          className={`${className} flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 animate-pulse`}
        >
          <div className="w-8 h-8 border-4 border-neutral-300 border-t-[#379937] rounded-full animate-spin"></div>
        </div>
      )}
      {imageState.loaded && imageState.currentSrc && (
        <img
          ref={imgRef}
          src={imageState.currentSrc}
          alt={alt}
          className={`${className} ${!imageState.loaded ? "hidden" : ""}`}
          loading={priority ? "eager" : loading}
          onClick={onClick}
          decoding="async"
        />
      )}
    </>
  );
};

export default function PhotoGallery() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [uploading, setUploading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const isDemo = JSON.parse(sessionStorage.getItem("isDemo")) || false;

  // Demo Mode State
  useEffect(() => {
    const demoFlag = JSON.parse(sessionStorage.getItem("isDemo")) || false;
    setIsDemoMode(demoFlag);
  }, []);

  // Feedback Banner
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("feedbackSent") === "true") {
      setShowFeedbackBanner(true);
      window.history.replaceState({}, document.title, "/main");
    }
  }, [location]);

  // Clean title helper
  const cleanTitle = (fileName) => {
    let name = fileName.includes("_")
      ? fileName.split("_").slice(1).join("_")
      : fileName;
    name = name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    return name.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Preload next/prev images in lightbox
  const preloadAdjacentImages = useCallback(
    (currentIndex) => {
      const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
      const nextIndex = (currentIndex + 1) % photos.length;

      [prevIndex, nextIndex].forEach((idx) => {
        const photo = photos[idx];
        if (
          photo &&
          !imageCache.has(photo.src) &&
          !failedImages.has(photo.src)
        ) {
          const img = new Image();
          img.src = photo.src;
          img.onload = () => imageCache.set(photo.src, photo.src);
          img.onerror = () => failedImages.add(photo.src);
        }
      });
    },
    [photos]
  );

  const filteredPhotos = useMemo(() => {
    if (!photos.length) return [];

    const text = debouncedSearch.trim().toLowerCase();

    return photos.filter((photo) => {
      const title = photo.title?.toLowerCase() || "";
      const desc = photo.desc?.toLowerCase() || "";

      const matchesText = !text || title.includes(text) || desc.includes(text);

      const matchesDate = dateFilter
        ? photo.dateCreated?.startsWith(dateFilter)
        : true;

      return matchesText && matchesDate;
    });
  }, [photos, debouncedSearch, dateFilter]);

  // Fetch user photos with caching
  const fetchUserPhotos = useCallback(async (userId) => {
    try {
      const data = await apiClient.get(`/api/images/user/${userId}`);

      if (!data.images || !Array.isArray(data.images)) {
        throw new Error("Invalid response format");
      }

      const processedPhotos = data.images
        .map((photo) => ({
          id: photo.id,
          key: photo.photoKey,
          src: photo.url,
          title: cleanTitle(photo.title),
          desc: photo.desc || "Uploaded by you",
          dateCreated: photo.dateCreated,
        }))
        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

      // Preload first few images
      processedPhotos.slice(0, 6).forEach((photo) => {
        if (!imageCache.has(photo.src)) {
          const img = new Image();
          img.src = photo.src;
          img.onload = () => imageCache.set(photo.src, photo.src);
        }
      });

      return processedPhotos;
    } catch (err) {
      console.error("Error fetching photos:", err);
      setError(getUserFriendlyMessage(err));
      return [];
    }
  }, []);

  // Initialize session
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userData = JSON.parse(sessionStorage.getItem("user"));

    if (!token || !userData) {
      navigate("/", { replace: true });
      return;
    }

    setUser(userData);

    // Banner: sessionStorage > user object > default
    const storedBanner = sessionStorage.getItem("bannerURL");
    setBannerImage(
      storedBanner ||
        userData.banner ||
        (theme === "dark" ? "/image (1).png" : "/image.png")
    );

    setChecking(false);

    if (isDemo) {
      try {
        const stored = localStorage.getItem("demoPhotos");
        let photosToLoad = demoPhotosArray;

        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter out invalid blob URLs
            photosToLoad = parsed.filter(
              (photo) => !photo.src.startsWith("blob:")
            );
            if (photosToLoad.length === 0) {
              photosToLoad = demoPhotosArray;
              localStorage.setItem(
                "demoPhotos",
                JSON.stringify(demoPhotosArray)
              );
            }
          } else {
            localStorage.setItem("demoPhotos", JSON.stringify(demoPhotosArray));
          }
        } else {
          localStorage.setItem("demoPhotos", JSON.stringify(demoPhotosArray));
        }

        setPhotos(photosToLoad);
      } catch (err) {
        console.error("Error loading demo photos:", err);
        setPhotos(demoPhotosArray);
        localStorage.setItem("demoPhotos", JSON.stringify(demoPhotosArray));
      } finally {
        setLoading(false);
      }
    } else {
      fetchUserPhotos(userData.id).then((fetched) => {
        setPhotos(fetched);
        setLoading(false);
      });
    }
  }, [navigate, fetchUserPhotos, theme, isDemo]);

  // Preload adjacent images when lightbox opens
  useEffect(() => {
    if (selectedPhoto) {
      const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
      if (currentIndex !== -1) {
        preloadAdjacentImages(currentIndex);
      }
    }
  }, [selectedPhoto, photos, preloadAdjacentImages]);

  // Upload Photo with validation and optimization
  const handleUpload = async () => {
    setUploadError("");

    if (!uploadFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    // Validate file
    try {
      validateFile(uploadFile, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        fieldName: "Photo",
      });
    } catch (validationError) {
      setUploadError(validationError.message);
      return;
    }

    setUploading(true);

    if (isDemo) {
      try {
        const reader = new FileReader();
        const img = new Image();

        reader.onload = (e) => {
          img.src = e.target.result;

          img.onload = () => {
            const MAX_WIDTH = 800;
            const scale = Math.min(MAX_WIDTH / img.width, 1);
            const canvas = document.createElement("canvas");
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

            const newPhoto = {
              id: Date.now(),
              key: uploadFile.name,
              src: compressedBase64,
              title: uploadTitle || `Photo ${photos.length + 1}`,
              desc: uploadDesc || "Uploaded by demo user",
              dateCreated: new Date().toISOString(),
            };

            // Add to cache immediately
            imageCache.set(compressedBase64, compressedBase64);

            const updated = [newPhoto, ...photos];
            setPhotos(updated);

            try {
              localStorage.setItem("demoPhotos", JSON.stringify(updated));
            } catch (e) {
              console.error("LocalStorage quota exceeded", e);
              setUploadError(
                "Storage limit reached. Please delete some photos."
              );
            }

            setUploadFile(null);
            setUploadTitle("");
            setUploadDesc("");
            setShowUploadModal(false);
            setUploading(false);
          };

          img.onerror = () => {
            setUploadError("Failed to process image");
            setUploading(false);
          };
        };

        reader.onerror = () => {
          setUploadError("Failed to read file");
          setUploading(false);
        };

        reader.readAsDataURL(uploadFile);
      } catch (err) {
        console.error("Upload error:", err);
        setUploadError("Failed to upload photo");
        setUploading(false);
      }
      return;
    }

    // Real upload
    try {
      const formData = new FormData();
      formData.append("file", uploadFile, uploadFile.name);
      formData.append("userId", user.id);
      formData.append("title", uploadTitle);
      formData.append("desc", uploadDesc);

      const data = await apiClient.uploadFile("/api/upload/image", formData);

      if (!data.photo) {
        throw new Error("Upload failed");
      }

      const newPhoto = {
        id: data.photo.id,
        key: data.photo.photoKey,
        src: data.photo.url,
        title: cleanTitle(data.photo.title),
        desc: data.photo.desc || "Uploaded by you",
        dateCreated: data.photo.dateCreated,
      };

      // Preload the new image
      const img = new Image();
      img.src = newPhoto.src;
      img.onload = () => imageCache.set(newPhoto.src, newPhoto.src);

      setPhotos((prev) => [newPhoto, ...prev]);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDesc("");
      setShowUploadModal(false);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(getUserFriendlyMessage(err));
    } finally {
      setUploading(false);
    }
  };

  // Edit Photo
  const handleEditSave = async ({ title, desc }) => {
    if (!selectedPhoto) return;

    setError("");

    if (isDemo) {
      const updated = photos.map((p) =>
        p.id === selectedPhoto.id ? { ...p, title, desc } : p
      );
      setPhotos(updated);
      setSelectedPhoto({ ...selectedPhoto, title, desc });

      try {
        localStorage.setItem("demoPhotos", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }

      setShowEditModal(false);
      return;
    }

    try {
      await apiClient.put(`/api/edit/${selectedPhoto.id}`, {
        UserId: user.id,
        Title: title,
        Desc: desc,
      });

      const updated = photos.map((p) =>
        p.id === selectedPhoto.id ? { ...p, title, desc } : p
      );
      setPhotos(updated);
      setSelectedPhoto({ ...selectedPhoto, title, desc });
      setShowEditModal(false);
    } catch (err) {
      console.error("Edit error:", err);
      setError(getUserFriendlyMessage(err));
    }
  };

  // Delete Photo
  const handleDelete = async () => {
    if (!selectedPhoto) return;

    setDeleteError("");

    if (isDemo) {
      const updated = photos.filter((p) => p.id !== selectedPhoto.id);

      // Remove from cache
      imageCache.delete(selectedPhoto.src);
      failedImages.delete(selectedPhoto.src);

      setPhotos(updated);
      setSelectedPhoto(null);

      try {
        localStorage.setItem("demoPhotos", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }
      return;
    }

    try {
      const { id: photoId, key: photoKey, src } = selectedPhoto;
      const encodedKey = encodeURIComponent(photoKey);

      await apiClient.delete(
        `/api/delete?userId=${user.id}&photoId=${photoId}&photoKey=${encodedKey}`
      );

      // Remove from cache
      imageCache.delete(src);
      failedImages.delete(src);

      const updated = photos.filter((p) => p.id !== photoId);
      setPhotos(updated);
      setSelectedPhoto(null);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(getUserFriendlyMessage(err));
    }
  };

  // Lightbox navigation with preloading
  const navigatePhoto = useCallback(
    (direction) => {
      if (!selectedPhoto) return;
      const idx = photos.findIndex((p) => p.id === selectedPhoto.id);
      const newIdx =
        direction === "prev"
          ? (idx - 1 + photos.length) % photos.length
          : (idx + 1) % photos.length;

      setSelectedPhoto(photos[newIdx]);
      setDeleteError("");
      preloadAdjacentImages(newIdx);
    },
    [selectedPhoto, photos, preloadAdjacentImages]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === "Escape") {
        setSelectedPhoto(null);
        setDeleteError("");
      }
      if (e.key === "ArrowLeft") navigatePhoto("prev");
      if (e.key === "ArrowRight") navigatePhoto("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, navigatePhoto]);

  // Loading state
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

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"
      }`}
    >
      {/* Demo Mode Banner */}
      {isDemoMode && showDemoBanner && (
        <div
          className={`w-full py-2 px-4 flex justify-center items-center text-sm font-semibold ${
            theme === "dark"
              ? "bg-yellow-600 text-neutral-900"
              : "bg-yellow-300 text-neutral-900"
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

      <header
        className={`w-full px-6 py-4 ${
          theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white"
        } shadow-md flex justify-between items-center sticky top-0 z-50 border-b`}
      >
        <h1 className="text-3xl font-bold text-[#379937]">MyGallery</h1>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === "dark" ? "text-neutral-400" : "text-neutral-500"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your memories..."
              className={`
          w-full pl-12 pr-4 py-2.5 rounded-xl
          border ${
            theme === "dark" ? "border-neutral-700" : "border-neutral-300"
          }
          ${
            theme === "dark" ? "bg-neutral-900/70" : "bg-white/70"
          } backdrop-blur
          ${
            theme === "dark"
              ? "text-neutral-400 placeholder:text-neutral-500"
              : "text-neutral-900 placeholder:text-neutral-400"
          }
          outline-none transition shadow-sm
          focus:ring-2 ${
            theme === "dark"
              ? "focus:ring-[#379937]/40"
              : "focus:ring-[#379937]/60"
          }
          focus:border-[#379937]
        `}
            />
          </div>

          <div className="relative flex-3">
            {/* Date Input */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              // Forces the browser's calendar popup to be dark or light
              style={{ colorScheme: theme === "dark" ? "dark" : "light" }}
              className={`
      w-full px-4 py-2.5 rounded-xl
      border outline-none transition-all shadow-sm
      backdrop-blur cursor-pointer
      
      /* Theme Styles */
      ${
        theme === "dark"
          ? "bg-neutral-900/70 border-neutral-700 text-neutral-400 focus:ring-[#379937]/40"
          : "bg-white/70 border-neutral-300 text-neutral-900 focus:ring-[#379937]/60"
      }
      
      focus:ring-2 focus:border-[#379937]

      /* THE TRICK: 
         1. Make the native indicator invisible.
         2. Position it absolutely to cover the entire container.
         3. This makes the whole 'box' the trigger for the picker.
      */
      [&::-webkit-calendar-picker-indicator]:absolute
      [&::-webkit-calendar-picker-indicator]:inset-0
      [&::-webkit-calendar-picker-indicator]:w-full
      [&::-webkit-calendar-picker-indicator]:h-full
      [&::-webkit-calendar-picker-indicator]:opacity-0
      [&::-webkit-calendar-picker-indicator]:cursor-pointer
    `}
            />
          </div>
        </div>

        {/* Upload & Profile */}
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-[#379937] text-white font-semibold shadow-md flex items-center gap-2 hover:bg-[#2d7e2d] transition"
          >
            <UploadCloud className="w-5 h-5" /> Upload
          </button>
          <ProfileDropdown
            profileImage={
              sessionStorage.getItem("profileURL") ||
              localStorage.getItem("demoProfileImage") ||
              user?.profileImage ||
              null
            }
          />
        </div>
      </header>

      {/* Global Error Message */}
      {error && (
        <div className="mx-6 mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative h-72 md:h-96 overflow-hidden flex items-center justify-center">
        {!(sessionStorage.getItem("bannerURL") || bannerImage) ? (
          <div
            className={`w-full h-full flex flex-col items-center justify-center ${
              theme === "dark" ? "bg-neutral-800" : "bg-neutral-300"
            }`}
          >
            <div
              className={`flex items-center justify-center w-24 h-24 rounded-full ${
                theme === "dark" ? "bg-neutral-900" : "bg-neutral-400"
              }`}
            >
              <svg
                className="w-12 h-12"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke={theme === "dark" ? "#a3a3a3" : "#ffffff"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
                />
              </svg>
            </div>
            <p
              className={`mt-4 text-center text-lg md:text-xl ${
                theme === "dark" ? "text-neutral-300" : "text-neutral-900"
              }`}
            >
              No custom banner set. Go to your profile to upload one!
            </p>
          </div>
        ) : (
          <>
            <OptimizedImage
              src={sessionStorage.getItem("bannerURL") || bannerImage}
              alt="Banner"
              className="w-full h-full object-cover"
              priority={true}
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white">
                {user?.name
                  ? `${user.name}'s Memories`
                  : "Your Memories. Organized Beautifully."}
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
            filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                layout
                whileHover={{ scale: 1.02 }}
                className={`mb-5 break-inside-avoid rounded-2xl overflow-hidden shadow-lg ${
                  theme === "dark" ? "bg-neutral-800" : "bg-white"
                } hover:shadow-xl transition cursor-pointer`}
                onClick={() => {
                  setSelectedPhoto(photo);
                  setDeleteError("");
                }}
              >
                <OptimizedImage
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-auto object-cover"
                  loading={index < 6 ? "eager" : "lazy"}
                  priority={index < 3}
                />
                <div className="p-4">
                  <p
                    className={`font-bold text-lg ${
                      theme === "dark" ? "text-white" : "text-neutral-900"
                    }`}
                  >
                    {photo.title}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {photo.desc}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <p
              className={`text-center col-span-full ${
                theme === "dark" ? "text-neutral-400" : "text-neutral-600"
              }`}
            >
              No photos yet. Upload your first memory!
            </p>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedPhoto(null);
              setDeleteError("");
            }}
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
              {/* Delete Error in Lightbox */}
              {deleteError && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 max-w-md w-full mx-4">
                  <div className="p-4 rounded-lg bg-red-500/90 border border-red-600 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <p className="text-white text-sm flex-1">{deleteError}</p>
                    <button
                      onClick={() => setDeleteError("")}
                      className="text-white hover:text-red-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div
                className={`flex-1 flex items-center justify-center overflow-hidden ${
                  theme === "dark" ? "bg-neutral-900" : "bg-neutral-300"
                }`}
              >
                <OptimizedImage
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-full object-contain"
                  priority={true}
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
                  className={`mt-2 ${
                    theme === "dark" ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  {selectedPhoto.desc}
                </p>
              </div>

              {/* Close Button */}
              <button
                className={`absolute top-4 right-4 p-3 rounded-full ${
                  theme === "dark"
                    ? "bg-black/60 hover:bg-black/80"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                onClick={() => {
                  setSelectedPhoto(null);
                  setDeleteError("");
                }}
              >
                <X
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                />
              </button>

              {/* Navigation */}
              <button
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full ${
                  theme === "dark"
                    ? "bg-black/60 hover:bg-black/80"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                onClick={() => navigatePhoto("prev")}
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
                onClick={() => navigatePhoto("next")}
              >
                <ChevronRight
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                />
              </button>

              {/* Edit/Delete Buttons */}
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

              {/* Photo Index */}
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
        setUploadFile={(file) => {
          setUploadFile(file);
          setUploadError("");
        }}
        uploadTitle={uploadTitle}
        setUploadTitle={setUploadTitle}
        uploadDesc={uploadDesc}
        setUploadDesc={setUploadDesc}
        handleUpload={handleUpload}
        uploading={uploading}
        error={uploadError}
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
        © 2025 MyGallery • Built with ❤️ by Colby Acton
      </footer>
    </div>
  );
}
