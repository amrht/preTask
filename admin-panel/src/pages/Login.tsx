import { useEffect } from "react";
import { useAuthStore } from "../store/userStore";  // adjust path accordingly
import { useNavigate } from "react-router-dom";

export default function Login() {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Redirect if user already exists
  useEffect(() => {
    if (user) {
      console.log("User already logged in, redirecting to /");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    /* global google */
    (window as any).google?.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!, // Make sure this is defined
      callback: handleCredentialResponse,
    });

    (window as any).google?.accounts.id.renderButton(
      document.getElementById("google-login-btn")!,
      {
        theme: "outline",
        size: "large",
      }
    );
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const res = await fetch("https://pretask-production.up.railway.app/api/users/auth", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${response.credential}`,
        },
      });

      const user = await res.json();
      console.log("Logged in user:", user);

      // Save token/user to localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // Also set user in Zustand store
      setUser(user);

      // Redirect to homepage or dashboard
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center w-full">
      <div id="google-login-btn" />
    </div>
  );
}
