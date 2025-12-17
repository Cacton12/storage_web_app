import { useState } from "react";
import { ArrowLeft, Mail, User, MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Feedback = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      alert("Please fill out all fields.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("api-proxy.colbyacton12.workers.dev/api/email/send-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (data.success) {
        // Clear form
        setName("");
        setEmail("");
        setMessage("");

        // Redirect to /main with query param
        navigate("/main?feedbackSent=true");
      } else {
        alert("Failed to send feedback. Please try again.");
      }
    } catch (err) {
      console.error("Error sending feedback:", err);
      alert("An error occurred while sending feedback.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-neutral-950" : "bg-neutral-100"}`}>
      {/* Header */}
      <div className={`${theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white"} shadow-md border-b sticky top-0 z-40`}>
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/main")}
            className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-600"}`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
            Feedback
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className={`rounded-3xl shadow-xl p-8 ${theme === "dark" ? "bg-neutral-900" : "bg-white"}`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-neutral-900"}`}>
            We’d Love to Hear From You
          </h2>

          {/* Name */}
          <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
            <User className="inline w-4 h-4 mr-2" />
            Your Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full mb-6 px-4 py-3 rounded-lg border outline-none transition ${
              theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"
            }`}
            placeholder="John Doe"
          />

          {/* Email */}
          <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
            <Mail className="inline w-4 h-4 mr-2" />
            Your Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full mb-6 px-4 py-3 rounded-lg border outline-none transition ${
              theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"
            }`}
            placeholder="you@example.com"
          />

          {/* Message */}
          <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-neutral-300" : "text-neutral-700"}`}>
            <MessageCircle className="inline w-4 h-4 mr-2" />
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`w-full h-40 px-4 py-3 rounded-lg border outline-none transition resize-none ${
              theme === "dark" ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-neutral-50 border-neutral-200 text-neutral-900"
            }`}
            placeholder="Tell us what's on your mind..."
          />

          {/* Submit */}
          <div className="mt-8 flex justify-center w-full">
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="flex items-center gap-2 bg-[#379937] hover:bg-[#2d7e2d] text-white font-semibold py-3 px-6 rounded-lg transition-colors w-1/2 justify-center disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {sending ? "Sending..." : "Send Feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
