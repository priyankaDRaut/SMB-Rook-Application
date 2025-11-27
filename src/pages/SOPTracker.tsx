
import React from 'react';
import { SOPTrackerSection } from '../components/dashboard/SOPTrackerSection';

const SOPTracker = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SOP Tracker</h1>
        <p className="text-gray-600">Monitor Standard Operating Procedure adherence across all clinics and zones.</p>
      </div>

      <SOPTrackerSection />
    </div>
  );
};

export default SOPTracker;
