
import React, { useState } from 'react';
import { HeaderBar } from '@/components/dashboard/HeaderBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Fixed on Left */}
      <div className="fixed left-0 top-0 bottom-0 z-30">
        <Sidebar 
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
        />
      </div>

      {/* Main Content Area with Header */}
      <div 
        className={cn(
          "flex-1 flex flex-col bg-gray-50/30 dark:bg-gray-800/30 border-l transition-all duration-300",
          isSidebarExpanded ? "ml-56" : "ml-16"
        )} 
        style={{ borderColor: '#e5e5e5' }}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20">
          <HeaderBar 
            dateRange={dateRange} 
            setDateRange={setDateRange}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};
