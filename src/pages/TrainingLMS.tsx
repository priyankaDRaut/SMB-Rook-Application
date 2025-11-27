
import React from 'react';
import { TrainingLMSSection } from '../components/dashboard/TrainingLMSSection';

const TrainingLMS = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Training & LMS</h1>
        <p className="text-gray-600">Monitor training completion, progress, and learning outcomes across all staff.</p>
      </div>

      <TrainingLMSSection />
    </div>
  );
};

export default TrainingLMS;
