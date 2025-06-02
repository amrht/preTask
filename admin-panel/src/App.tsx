import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";
import ArtistsPage from "./pages/Artist";
import ContentsPage from "./pages/Content";
import UsersPage from "./pages/User";

export default function App() {
  return (
    <>
    <Toaster position="top-right" />
    <div className="flex h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Sidebar />
              <main className="flex-1 p-6 bg-gray-100">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/artist" element={<ArtistsPage />} />
                  <Route path="/content" element={<ContentsPage />} />
                  <Route path="/user" element={<UsersPage />} />
                </Routes>
              </main>
            </RequireAuth>
          }
        />
      </Routes>
    </div>
    </>
  );
}
