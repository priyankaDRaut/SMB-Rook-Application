import React from 'react';
import { ClinicPerformanceSection } from '../components/dashboard/ClinicPerformanceSection';

const Clinics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clinic Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complete overview of all clinic locations and their performance.
        </p>
      </div>

      {/* Clinic Performance Section - This contains the clickable clinic list with filters */}
      <ClinicPerformanceSection selectedZone="All Zones" />
    </div>
  );
};

export default Clinics;
