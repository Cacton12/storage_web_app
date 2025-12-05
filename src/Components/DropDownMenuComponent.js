import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, User, Settings, Moon, Sun, HelpCircle} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';


const ProfileDropdown = () => {

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async (e) => {
    e.preventDefault();

    // Pure client-side logout: clear stored JWT and user info, then navigate home.
    try {
      console.log("Logging out, clearing session storage");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      console.log("cleared session storage");
    } catch (err) {
      console.log("couldnt logout didnt work");
    }

    navigate("/");
}

  return (
    <DropdownMenu.Root>
      {/* Trigger = profile picture */}
      <DropdownMenu.Trigger asChild>
        <button className="rounded-full size-10 overflow-hidden border border-neutral-300 hover:ring-2 hover:ring-green-500 transition">
          <img
            src="/images/SomeDude.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`min-w-[220px] rounded-xl shadow-xl border p-2 
          animate-in fade-in slide-in-from-top-2 ${theme === "dark" ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200"}`}
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
            <span className="text-xs px-2 py-0.5 rounded bg-inherit">
              {theme === "light" ? "🌙" : "☀️"}
            </span>

          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer outline-none ${
              theme === "dark" ? "text-neutral-200 hover:bg-neutral-700" : "text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <Settings size={16} />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer outline-none ${
              theme === "dark" ? "text-neutral-200 hover:bg-neutral-700" : "text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            <HelpCircle size={16} />
            Help & Support
          </DropdownMenu.Item>

          <DropdownMenu.Separator className={`my-2 h-px ${theme === "dark" ? "bg-neutral-700" : "bg-neutral-200"}`} />

          <DropdownMenu.Item
            onClick={handleLogout}
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer outline-none ${
              theme === "dark" ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-100"
            }`}
          >
            <LogOut size={16}/>
            Logout
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className={theme === "dark" ? "fill-neutral-900" : "fill-white"} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ProfileDropdown;
