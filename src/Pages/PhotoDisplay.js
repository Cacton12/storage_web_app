import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UploadCloud, X } from "lucide-react";
import ProfileDropdown from "../Components/DropDownMenuComponent";
import { useNavigate } from "react-router-dom";

export default function PhotoGallery() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-neutral-100 flex flex-col">

      {/* Header */}
      <header className="w-full px-6 py-4 bg-white shadow-md flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-3xl font-bold text-[#379937]">MyGallery</h1>

        <div className="hidden md:flex items-center bg-neutral-200 px-4 py-2 rounded-xl w-96">
          <Search className="w-5 h-5 text-neutral-600" />
          <input
            type="text"
            placeholder="Search your photos..."
            className="ml-3 bg-transparent focus:outline-none w-full text-neutral-800"
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
              className="mb-5 break-inside-avoid rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.src}
                alt={photo.title}
                className="w-full h-auto object-cover"
              />
              <div className="p-4">
                <p className="font-bold text-lg text-neutral-900">{photo.title}</p>
                <p className="text-sm text-neutral-600 mt-1">{photo.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button
                className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-neutral-100"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-6 h-6 text-neutral-800" />
              </button>
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="w-full max-h-[80vh] object-contain bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-6 mt-10 text-center text-neutral-500">
        © 2025 MyGallery • Built with ❤️ by You
      </footer>
    </div>
  );
}
