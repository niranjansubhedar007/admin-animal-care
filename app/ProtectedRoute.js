// components/ProtectedRoute.js
"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      // Replace current history entry with login page
      window.history.replaceState(null, '', '/login');
      router.replace('/login');
    }
  }, [router]);

  return children;
};

export default ProtectedRoute;