// hooks/useAuth.js
"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.replace('/login');
      }
    };

    // Check auth on initial load
    checkAuth();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', checkAuth);

    return () => {
      window.removeEventListener('popstate', checkAuth);
    };
  }, [router]);

  return {
    isAuthenticated: !!localStorage.getItem('authToken')
  };
};