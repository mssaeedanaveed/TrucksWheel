import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Check localStorage for existing user
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth on mount
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
    
    // Listen for auth changes (like logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        const user = localStorage.getItem('user');
        setIsAuthenticated(!!user);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return isAuthenticated;
};

const ProtectedRoute = ({ children }) => {
  const isAuth = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - isAuth:', isAuth);
  console.log('ProtectedRoute - location:', location);

  useEffect(() => {
    console.log('ProtectedRoute - useEffect - isAuth:', isAuth);
    
    // If not authenticated, store the attempted URL for redirect after login
    if (!isAuth) {
      const currentPath = location.pathname + (location.search || '');
      console.log('ProtectedRoute - Not authenticated, storing redirect path:', currentPath);
      
      if (currentPath !== '/auth') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
    }
  }, [isAuth, location]);

  if (!isAuth) {
    console.log('ProtectedRoute - Not authenticated, redirecting to /auth');
    
    // Create redirect state
    const redirectState = { 
      from: {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash
      },
      message: 'Please sign in to view this page'
    };
    
    console.log('ProtectedRoute - Redirect state:', redirectState);
    
    // Redirect to login page with the return URL
    return (
      <Navigate 
        to="/auth" 
        state={redirectState} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;
