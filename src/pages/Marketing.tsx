
import React from 'react';
import { MarketingMetricsSection } from '../components/dashboard/MarketingMetricsSection';
import { ExpenseManagementSection } from '../components/dashboard/ExpenseManagementSection';

const Marketing = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
        <p className="text-gray-600">Track marketing campaigns, ROI, and lead generation across all channels.</p>
      </div>

      <MarketingMetricsSection />
      <ExpenseManagementSection />
    </div>
  );
};

export default Marketing;
