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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-64 bg-white shadow-lg p-4 flex flex-col h-full shadow-xl rounded-md text-black">
      <ScrollArea className="flex-grow">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <nav className="space-y-2">
            <Link to="/">
              <Button variant="default" className="w-full justify-start text-black border border-black bg-white hover:text-white hover:bg-gray-500">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Button>
            </Link>
            </nav>
            <nav className="space-y-2">
            <Link to="/artist">
              <Button variant="default" className="w-full justify-start text-black border border-black bg-white hover:text-white hover:bg-gray-500">
                <Baby className="mr-2 h-5 w-5" />
                Artist
              </Button>
            </Link>
            </nav>
            <nav className="space-y-2">
            <Link to="/content">
              <Button variant="default" className="w-full justify-start text-black border border-black bg-white hover:text-white hover:bg-gray-500">
                <BiBookContent className="mr-2 h-5 w-5" />
                Content
              </Button>
            </Link>
            </nav>
            <nav className="space-y-2">
            <Link to="/user">
              <Button variant="default" className="w-full justify-start text-black border border-black bg-white hover:text-white hover:bg-gray-500">
                <FaUser className="mr-2 h-5 w-5" />
                Users
              </Button>
            </Link>
          </nav>
        </div>
      </ScrollArea>

      {/* Logout button fixed at bottom */}
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
  );
}
