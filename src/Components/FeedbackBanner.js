import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

const FeedbackBanner = ({ message = "Thanks for the feedback!", duration = 4000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const controls = useAnimation();

  useEffect(() => {
    // Animate progress bar smoothly
    controls.start({ scaleX: 0, transition: { duration: duration / 1000, ease: "linear" } });

    // Hide banner after duration
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, controls, onClose]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none"
      >
        <div className="relative bg-[#379937] text-white font-semibold px-6 py-3 rounded-b-lg shadow-lg pointer-events-auto max-w-2xl w-full mx-4 overflow-hidden">
          {message}

          {/* Smooth progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white origin-left rounded-b-lg"
            initial={{ scaleX: 1 }}
            animate={controls}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FeedbackBanner;
