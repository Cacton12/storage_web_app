import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UploadCloud, X, ChevronLeft, ChevronRight } from "lucide-react";
import ProfileDropdown from "../Components/DropDownMenuComponent";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function PhotoGallery() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // TOKEN CHECK
  const [checking, setChecking] = useState(true);

  // LOADING STATE
  const [loading, setLoading] = useState(true);

  // PHOTO DATA
  const photos = useMemo(() => [
    { id: 1, src: "/images/BridgeWaterFall.jpg", title: "Mountain View", desc: "A calm morning in the Rockies." },
    { id: 2, src: "/images/FlowerMountains.jpg", title: "Forest Path", desc: "A peaceful walk among tall trees." },
    { id: 3, src: "/images/FoggyTrees.jpg", title: "City Lights", desc: "Downtown glowing at night." },
    { id: 4, src: "/images/MountiansDeer.jpg", title: "Ocean Sunset", desc: "Waves crashing under vibrant skies." },
    { id: 5, src: "/images/ladyInHills.jpg", title: "Camping Trip", desc: "Cozy nights by the fire." },
    { id: 6, src: "/images/Valley.jpg", title: "Snowy Trees", desc: "Fresh snow on pine branches." },
  ], []);

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // KEYBOARD NAVIGATION
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedPhoto) return;
      if (e.key === "Escape") setSelectedPhoto(null);
      if (e.key === "ArrowLeft") {
        const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
        const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
        setSelectedPhoto(photos[prevIndex]);
      }
      if (e.key === "ArrowRight") {
        const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
        const nextIndex = (currentIndex + 1) % photos.length;
        setSelectedPhoto(photos[nextIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, photos]);

  // TOKEN CHECK
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    setChecking(false);
  }, [navigate]);

  // IMAGE PRELOAD
  useEffect(() => {
    if (checking) return; // wait until token is checked

    const allImages = [
      "/images/LadyInHills.jpg", // hero banner
      ...photos.map((p) => p.src),
    ];

    let loaded = 0;
    allImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded === allImages.length) setLoading(false);
      };
    });
  }, [checking, photos]);

  if (checking || loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 border-4 border-neutral-300 border-t-[#379937] rounded-full"></div>
          <p className="text-neutral-600">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>

      {/* Header */}
      <header className={`w-full px-6 py-4 ${theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white"} shadow-md flex justify-between items-center sticky top-0 z-50 border-b`}>
        <h1 className="text-3xl font-bold text-[#379937]">MyGallery</h1>

        <div className={`hidden md:flex items-center ${theme === "dark" ? "bg-neutral-800" : "bg-neutral-200"} px-4 py-2 rounded-xl w-96`}>
          <Search className="w-5 h-5 text-neutral-600" />
          <input
            type="text"
            placeholder="Search your photos..."
            className={`ml-3 bg-transparent focus:outline-none w-full ${theme === "dark" ? "text-white placeholder-neutral-400" : "text-neutral-800"}`}
          />
        </div>

        <div className="flex gap-4 items-center">
          <button className="px-4 py-2 rounded-xl bg-[#379937] text-white font-semibold shadow-md flex items-center gap-2">
            <UploadCloud className="w-5 h-5" /> Upload
          </button>
          <ProfileDropdown />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-72 md:h-96 overflow-hidden">
        <img
          src="/images/LadyInHills.jpg"
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6">
          <h2 className="text-4xl md:text-6xl font-bold text-white">Your Memories. Organized Beautifully.</h2>
          <p className="text-white text-lg md:text-xl mt-4 max-w-2xl">A clean and immersive way to store and view your photos.</p>
        </div>
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
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-auto object-cover"
              />
              <div className="p-4">
                <p className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>{photo.title}</p>
                <p className={`text-sm ${theme === "dark" ? "text-neutral-400" : "text-neutral-600"} mt-1`}>{photo.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              className="relative bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Container */}
              <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Info Section */}
              <div className={`${theme === "dark" ? "bg-neutral-800" : "bg-white"} px-6 py-4 border-t ${theme === "dark" ? "border-neutral-700" : "border-neutral-100"}`}>
                <h3 className="text-2xl font-bold text-white">{selectedPhoto.title}</h3>
                <p className="text-neutral-300 mt-2">{selectedPhoto.desc}</p>
              </div>

              {/* Close Button */}
              <button
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Navigation Buttons */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm group"
                onClick={() => {
                  const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
                  const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
                  setSelectedPhoto(photos[prevIndex]);
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm group"
                onClick={() => {
                  const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
                  const nextIndex = (currentIndex + 1) % photos.length;
                  setSelectedPhoto(photos[nextIndex]);
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Photo Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm font-semibold backdrop-blur-sm">
                {photos.findIndex((p) => p.id === selectedPhoto.id) + 1} / {photos.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`w-full py-6 mt-10 text-center ${theme === "dark" ? "text-neutral-500" : "text-neutral-500"}`}>
        © 2025 MyGallery • Built with ❤️ by You
      </footer>
    </div>
  );
}
