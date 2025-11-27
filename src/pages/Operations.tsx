
import React from 'react';
import { OperationalMetricsSection } from '../components/dashboard/OperationalMetricsSection';
import { TreatmentPerformanceSection } from '../components/dashboard/TreatmentPerformanceSection';

const Operations = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
        <p className="text-gray-600">Monitor operational efficiency, treatment performance, and clinic operations.</p>
      </div>

      <OperationalMetricsSection />
      <TreatmentPerformanceSection />
    </div>
  );
};

export default Operations;
