import { useState } from "react";
import { Baby, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/userStore";
import { BiBookContent } from "react-icons/bi";
import { FaUser } from "react-icons/fa";

export default function Sidebar() {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // mobile sidebar toggle

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const NavLinks = () => (
    <>
      <nav className="space-y-2">
        <Link to="/">
          <Button className="w-full my-1 justify-start text-black border border-black bg-white hover:text-white hover:bg-gray-500">
            <Home className="mr-2 h-5 w-5" />
            Home
          </Button>
        </Link>
        <Link to="/artist">
          <Button className="w-full my-1 justify-start text-black border border-black bg-white hover:text-white hover:bg-gray-500">
            <Baby className="mr-2 h-5 w-5" />
            Artist
          </Button>
        </Link>
        <Link to="/content">
          <Button className="w-full my-1 justify-start text-black border border-black bg-white hover:text-white hover:bg-gray-500">
            <BiBookContent className="mr-2 h-5 w-5" />
            Content
          </Button>
        </Link>
        <Link to="/user">
          <Button className="w-full my-1 justify-start text-black border border-black bg-white hover:text-white hover:bg-gray-500">
            <FaUser className="mr-2 h-5 w-5" />
            Users
          </Button>
        </Link>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      {/* Mobile toggle button - floating at top */}
<div className="md:hidden">
  <Button
    onClick={toggleSidebar}
    className="absolute top-4 left-6 z-50 bg-white text-black border border-black shadow-md"
  >
    Menu
  </Button>
</div>


      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 bg-white shadow-lg p-4 flex-col h-full shadow-xl rounded-md text-black">
        <ScrollArea className="flex-grow">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <NavLinks />
          </div>
        </ScrollArea>
        <div className="mt-4">
          <Button
            variant="destructive"
            className="w-full justify-start text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Slide-in mobile sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 flex flex-col text-black transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button onClick={toggleSidebar} className="text-lg font-semibold">✕</button>
        </div>
        <ScrollArea className="flex-grow">
          <NavLinks />
        </ScrollArea>
        <div className="mt-4">
          <Button
            variant="destructive"
            className="w-full justify-start text-white"
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
