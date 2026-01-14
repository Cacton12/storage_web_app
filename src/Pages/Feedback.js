import { useState } from "react";
import { ArrowLeft, Mail, User, MessageCircle, Send, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import apiClient from "../utils/apiClient";
import { getUserFriendlyMessage } from "../utils/apiErrorHandler";
import { validateField, ValidationError } from "../utils/validation";

const Feedback = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    try {
      validateField(name, [
        (val) => {
          if (!val || val.trim() === "") throw new ValidationError("name", "Name is required");
          if (val.trim().length < 2) throw new ValidationError("name", "Name must be at least 2 characters");
        }
      ]);
    } catch (error) {
      newErrors.name = error.message;
    }

    try {
      validateField(email, [
        (val) => {
          if (!val || val.trim() === "") throw new ValidationError("email", "Email is required");
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            throw new ValidationError("email", "Please enter a valid email address");
          }
        }
      ]);
    } catch (error) {
      newErrors.email = error.message;
    }

    try {
      validateField(message, [
        (val) => {
          if (!val || val.trim() === "") throw new ValidationError("message", "Message is required");
          if (val.trim().length < 10) throw new ValidationError("message", "Message must be at least 10 characters");
          if (val.trim().length > 1000) throw new ValidationError("message", "Message must be less than 1000 characters");
        }
      ]);
    } catch (error) {
      newErrors.message = error.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});
    setGeneralError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Demo mode
    if (sessionStorage.getItem("isDemo") === "true") {
      navigate("/main?feedbackSent=true");
      return;
    }

    setSending(true);

    try {
      const data = await apiClient.post("/api/feedback", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      if (data.success) {
        setName("");
        setEmail("");
        setMessage("");
        navigate("/main?feedbackSent=true");
      } else {
        setGeneralError(data.error || "Failed to send feedback. Please try again.");
      }
    } catch (error) {
      console.error("Feedback error:", error);
      setGeneralError(getUserFriendlyMessage(error));
    } finally {
      setSending(false);
    }
  };

  const handleFieldChange = (field, value, setter) => {
    setter(value);
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"
      }`}
    >
      {/* Header */}
      <div
        className={`${
          theme === "dark"
            ? "bg-neutral-900 border-neutral-800"
            : "bg-white border-neutral-200"
        } shadow-md border-b sticky top-0 z-40`}
      >
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/main")}
            className={`p-2 rounded-lg transition active:scale-95 ${
              theme === "dark"
                ? "hover:bg-neutral-800 active:bg-neutral-700 text-neutral-400"
                : "hover:bg-neutral-100 active:bg-neutral-200 text-neutral-600"
            }`}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1
            className={`text-xl sm:text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-neutral-900"
            }`}
          >
            Feedback
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        <div
          className={`rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 ${
            theme === "dark" ? "bg-neutral-900" : "bg-white"
          }`}
        >
          <h2
            className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${
              theme === "dark" ? "text-white" : "text-neutral-900"
            }`}
          >
            We'd Love to Hear From You
          </h2>

          {/* General Error Message */}
          {generalError && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 sm:gap-3 animate-shake">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-xs sm:text-sm">{generalError}</p>
            </div>
          )}

          {/* Name */}
          <div className="mb-4 sm:mb-6">
            <label
              className={`block text-xs sm:text-sm font-semibold mb-2 ${
                theme === "dark" ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              <User className="inline w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Your Name
            </label>
            <input
              value={name}
              onChange={(e) => handleFieldChange("name", e.target.value, setName)}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base border outline-none transition ${
                errors.name 
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                  : theme === "dark"
                  ? "bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:border-[#379937] focus:ring-2 focus:ring-[#379937]/20"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-[#379937] focus:ring-2 focus:ring-[#379937]/20"
              }`}
              placeholder="John Doe"
              disabled={sending}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs sm:text-sm text-red-500 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4 sm:mb-6">
            <label
              className={`block text-xs sm:text-sm font-semibold mb-2 ${
                theme === "dark" ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              <Mail className="inline w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base border outline-none transition ${
                errors.email 
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                  : theme === "dark"
                  ? "bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:border-[#379937] focus:ring-2 focus:ring-[#379937]/20"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-[#379937] focus:ring-2 focus:ring-[#379937]/20"
              }`}
              placeholder="john@example.com"
              disabled={sending}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs sm:text-sm text-red-500 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="mb-4 sm:mb-6">
            <label
              className={`block text-xs sm:text-sm font-semibold mb-2 ${
                theme === "dark" ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              <MessageCircle className="inline w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => handleFieldChange("message", e.target.value, setMessage)}
              className={`w-full h-32 sm:h-40 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base border outline-none transition resize-none ${
                errors.message 
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                  : theme === "dark"
                  ? "bg-neutral-800 border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:border-[#379937] focus:ring-2 focus:ring-[#379937]/20"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:border-[#379937] focus:ring-2 focus:ring-[#379937]/20"
              }`}
              placeholder="Share your thoughts, suggestions, or report issues..."
              disabled={sending}
            />
            {errors.message && (
              <p className="mt-1.5 text-xs sm:text-sm text-red-500 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                {errors.message}
              </p>
            )}
            <p className={`mt-1.5 text-xs ${theme === "dark" ? "text-neutral-500" : "text-neutral-400"}`}>
              {message.length}/1000 characters
            </p>
          </div>

          {/* Submit */}
          <div className="mt-6 sm:mt-8">
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="w-full sm:w-auto sm:min-w-[200px] flex items-center justify-center gap-2 bg-[#379937] hover:bg-[#2d7e2d] active:bg-[#266d26] text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-md hover:shadow-lg text-sm sm:text-base mx-auto"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Feedback;