
import React from 'react';
import { PatientMetricsSection } from '../components/dashboard/PatientMetricsSection';

const Patients = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Analytics</h1>
        <p className="text-gray-600">Monitor patient visits, satisfaction, and engagement metrics.</p>
      </div>

      <PatientMetricsSection />
    </div>
  );
};

export default Patients;
