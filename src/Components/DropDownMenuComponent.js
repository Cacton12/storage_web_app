import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, User, Moon, Sun, MessageCircle} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { demoPhotosArray } from "../Pages/PhotoDisplay";


const ProfileDropdown = ({ profileImage }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async (e) => {
    e.preventDefault();
    console.log(demoPhotosArray);
    try {
      if (JSON.parse(sessionStorage.getItem("isDemo"))) {
        localStorage.setItem("demoPhotos", JSON.stringify(demoPhotosArray));
        console.log("Demo photos saved to localStorage.");
      }
      console.log("Logging out...");
      sessionStorage.clear();
    } catch (err) {
      console.log("Logout error:", err);
    }
    navigate("/");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="rounded-full w-10 h-10 overflow-hidden border border-neutral-300 hover:ring-2 hover:ring-green-500 transition">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`relative w-full h-full overflow-hidden rounded-full ${
                theme === "dark" ? "bg-neutral-700" : "bg-neutral-300"
              }`}
            >
              <svg
                className={`absolute w-12 h-12 -left-1 ${
                  theme === "dark" ? "text-neutral-400" : "text-neutral-500"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`min-w-[220px] rounded-xl shadow-xl border p-2 animate-in fade-in slide-in-from-top-2 ${
            theme === "dark" ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200"
          }`}
          sideOffset={10}
        >
          {/* Profile Header */}
          <div className={`px-3 py-2 border-b ${theme === "dark" ? "border-neutral-700" : "border-neutral-200"}`}>
            <p className={`font-semibold ${theme === "dark" ? "text-neutral-200" : "text-neutral-800"}`}>Colby Acton</p>
            <p className={`text-sm ${theme === "dark" ? "text-neutral-400" : "text-neutral-500"}`}>colby@example.com</p>
          </div>

          {/* Menu Items */}
          <DropdownMenu.Item
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer outline-none ${
              theme === "dark" ? "text-neutral-200 hover:bg-neutral-700" : "text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <User size={16} />
            My Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={toggleTheme}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer outline-none ${
              theme === "dark" ? "text-neutral-200 hover:bg-neutral-700" : "text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </div>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => navigate("/feedback")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer outline-none ${
              theme === "dark" ? "text-neutral-200 hover:bg-neutral-700" : "text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <MessageCircle size={16} />
            Feedback
          </DropdownMenu.Item>

          <DropdownMenu.Separator className={`my-2 h-px ${theme === "dark" ? "bg-neutral-700" : "bg-neutral-200"}`} />

          <DropdownMenu.Item
            onClick={handleLogout}
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer outline-none ${
              theme === "dark" ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-100"
            }`}
          >
            <LogOut size={16} />
            Logout
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className={theme === "dark" ? "fill-neutral-900" : "fill-white"} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ProfileDropdown;
