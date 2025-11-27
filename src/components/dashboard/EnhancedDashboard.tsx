
import React from 'react';
import { KPISection } from './KPISection';

export const EnhancedDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Focused Content - KPIs and Clinic Performance combined */}
      <div className="space-y-6">
        {/* Temporarily hidden for focused build */}
        {/* <AnnouncementTicker /> */}
        
        {/* KPI Section with integrated Clinic Performance */}
        <KPISection />
        
        {/* Temporarily hidden for focused build */}
        {/* <InventoryLogCards /> */}
      </div>

      {/* Temporarily hidden AI Insights Panel for focused build */}
      {/* <div className="xl:col-span-1">
        <div className="sticky top-6">
          <AIInsightsPanel />
        </div>
      </div> */}
    </div>
  );
};
