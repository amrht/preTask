import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/userStore';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

export default function RequireAuth({ children }: PropsWithChildren) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {

    if (!user) {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem('user');
        }
      } else {
        console.log('RequireAuth: No user found in localStorage');
      }
    }
  }, [user, setUser]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
