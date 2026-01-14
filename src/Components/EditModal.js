import { useState, useEffect } from "react";

export default function EditPhotoModal({ 
  show, 
  onClose, 
  photo, 
  onSave 
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // Populate fields when modal opens
  useEffect(() => {
    if (photo) {
      setTitle(photo.title || "");
      setDesc(photo.desc || "");
    }
  }, [photo]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-neutral-900 dark:text-white">
          Edit Photo
        </h2>

        <label className="block mb-2 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
        />

        <label className="block mb-2 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Description
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full p-2 mb-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm min-h-[100px]"
        />

        <div className="flex justify-end gap-2 sm:gap-4">
          <button
            className="px-3 sm:px-4 py-2 text-sm rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition whitespace-nowrap"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 sm:px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
            onClick={() => onSave({ title, desc })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
