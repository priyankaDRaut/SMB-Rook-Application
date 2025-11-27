import { useState, useEffect } from 'react';

interface SystemStatus {
  isOnline: boolean;
  lastChecked: Date;
}

interface QuickTip {
  message: string;
  type: 'tip' | 'stat';
}

const QUICK_TIPS: QuickTip[] = [
  { message: "Avg. waiting time: 7 mins", type: 'stat' },
  { message: "Use filters to compare performance", type: 'tip' },
  { message: "Press '/' to quick search", type: 'tip' },
  { message: "Patient satisfaction: 94%", type: 'stat' },
];

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({ isOnline: true, lastChecked: new Date() });
  const [currentTip, setCurrentTip] = useState<QuickTip>(QUICK_TIPS[0]);

  useEffect(() => {
    // Simulate API health check
    const checkStatus = async () => {
      try {
        // Replace with actual API health check endpoint
        // const response = await fetch('/api/health');
        // const isOnline = response.ok;
        const isOnline = true; // Temporary mock
        setStatus({ isOnline, lastChecked: new Date() });
      } catch (error) {
        setStatus({ isOnline: false, lastChecked: new Date() });
      }
    };

    // Check status initially and every 30 seconds
    checkStatus();
    const statusInterval = setInterval(checkStatus, 30000);

    // Rotate quick tips every 10 seconds
    let tipIndex = 0;
    const tipInterval = setInterval(() => {
      tipIndex = (tipIndex + 1) % QUICK_TIPS.length;
      setCurrentTip(QUICK_TIPS[tipIndex]);
    }, 10000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return { status, currentTip };
} 