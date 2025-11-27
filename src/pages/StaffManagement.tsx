
import React from 'react';
import { StaffManagementSection } from '../components/dashboard/StaffManagementSection';

const StaffManagement = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-600">Monitor staff performance, attendance, and retention across all zones.</p>
      </div>

      <StaffManagementSection />
    </div>
  );
};

export default StaffManagement;
