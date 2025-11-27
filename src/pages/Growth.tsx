
import React from 'react';
import { GrowthMetricsSection } from '../components/dashboard/GrowthMetricsSection';
import { DetailedFinancialSection } from '../components/dashboard/DetailedFinancialSection';
import { TreatmentPerformanceSection } from '../components/dashboard/TreatmentPerformanceSection';

const Growth = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Growth Analytics</h1>
        <p className="text-blue-600">Track growth metrics, expansion opportunities, and revenue forecasting.</p>
      </div>

      <GrowthMetricsSection />
      <DetailedFinancialSection />
      <TreatmentPerformanceSection />
    </div>
  );
};

export default Growth;
