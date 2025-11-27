
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['super-admin', 'smilebird-admin', 'clinic-admin'],
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { userRole } = useRole();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed to access this route
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect based on user's actual role
    switch (userRole) {
      case 'smilebird-admin':
        return <Navigate to="/clinics" replace />;
      case 'clinic-admin':
        return <Navigate to="/clinics" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
