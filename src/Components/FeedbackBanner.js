import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackBanner({
  message,
  show,
  onClose,
  autoHide = 4000000,
}) {
  // Auto hide after duration
  if (show && autoHide) {
    setTimeout(() => {
      onClose();
    }, autoHide);
  }

  return (
<AnimatePresence>
  {show && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex justify-center items-start pt-24 z-[50]"
    >
      <div className="px-6 bg-green-600 text-white py-3 rounded-xl shadow-lg flex items-center justify-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 font-bold hover:text-gray-200">
          ✕
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>

  );
}
