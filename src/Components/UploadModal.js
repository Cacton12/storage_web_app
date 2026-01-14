

import { AnimatePresence, motion } from "framer-motion";
import { X, UploadCloud } from "lucide-react";

const UploadModal = ({
  showUploadModal,
  setShowUploadModal,
  theme,
  uploadFile,
  setUploadFile,
  uploadTitle,
  setUploadTitle,
  uploadDesc,
  setUploadDesc,
  handleUpload,
}) => {
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setUploadFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
    {showUploadModal && (
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowUploadModal(false)}
      >
        <motion.div
          className={`w-full max-w-lg rounded-2xl shadow-xl p-4 sm:p-6 ${
            theme === "dark" ? "bg-neutral-900" : "bg-white"
          }`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-xl sm:text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-neutral-900"
              }`}
            >
              Upload Photo
            </h2>
            <button
              onClick={() => setShowUploadModal(false)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600 dark:text-neutral-300" />
            </button>
          </div>

          {/* Drag + Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`w-full h-40 sm:h-48 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer ${
              theme === "dark"
                ? "border-neutral-700 hover:border-[#379937]"
                : "border-neutral-300 hover:border-[#379937]"
            } transition mb-4`}
            onClick={() => document.getElementById("uploadInputHidden").click()}
          >
            {uploadFile ? (
              <img
                src={URL.createObjectURL(uploadFile)}
                alt="Preview"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center text-center px-4">
                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-500" />
                <p
                  className={`mt-2 text-sm sm:text-base ${
                    theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Drag & drop or click to upload
                </p>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            id="uploadInputHidden"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setUploadFile(e.target.files[0])}
          />

          {/* Title */}
          <input
            type="text"
            placeholder="Photo Title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className={`w-full px-4 py-2 rounded-xl mb-3 outline-none ${
              theme === "dark"
                ? "bg-neutral-800 text-white placeholder-neutral-500"
                : "bg-neutral-100 text-neutral-900 placeholder-neutral-500"
            }`}
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={uploadDesc}
            onChange={(e) => setUploadDesc(e.target.value)}
            rows="3"
            className={`w-full px-4 py-2 rounded-xl mb-4 outline-none ${
              theme === "dark"
                ? "bg-neutral-800 text-white placeholder-neutral-500"
                : "bg-neutral-100 text-neutral-900 placeholder-neutral-500"
            }`}
          ></textarea>

          {/* Upload button */}
          <button
            onClick={() => {
              if (!uploadFile) return alert("Please select a photo first.");

              handleUpload({ target: { files: [uploadFile] } });
              setShowUploadModal(false);

              setUploadFile(null);
              setUploadTitle("");
              setUploadDesc("");
            }}
            className="w-full py-3 rounded-xl bg-[#379937] text-white font-semibold hover:bg-[#2f7e2e] transition"
          >
            Upload Photo
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

)};
export default UploadModal