
import React from 'react';
import { Navigate } from 'react-router-dom';
import { EnhancedDashboard } from '../components/dashboard/EnhancedDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

const Dashboard = () => {
  const { isAuthenticated, userData } = useAuth();

  if (!isAuthenticated || !userData) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout>
      <EnhancedDashboard />
    </AppLayout>
  );
};

export default Dashboard;
