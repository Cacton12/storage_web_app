import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from 'react-router-dom';


const ProfileDropdown = () => {

  const navigate = useNavigate();

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
          className="min-w-[180px] rounded-xl bg-white shadow-xl border border-neutral-200 p-2 
          animate-in fade-in slide-in-from-top-2"
          sideOffset={10}
        >
          {/* Profile Header */}
          <div className="px-3 py-2 border-b border-neutral-200">
            <p className="font-semibold text-neutral-800">Colby Acton</p>
            <p className="text-sm text-neutral-500">colby@example.com</p>
          </div>

          {/* Menu Items */}
          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer 
            hover:bg-neutral-100 outline-none"
          >
            <User size={16} />
            My Profile
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer 
            hover:bg-neutral-100 outline-none"
          >
            <Settings size={16} />
            Settings
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-2 h-px bg-neutral-200" />

          <DropdownMenu.Item
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer 
            text-red-600 hover:bg-red-100 outline-none"
          >
            <LogOut size={16}/>
            Logout
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ProfileDropdown;
