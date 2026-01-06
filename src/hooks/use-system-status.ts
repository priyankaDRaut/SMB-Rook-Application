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
  { message: "Use filters to compare performance", type: 'tip' },
  { message: "Press '/' to quick search", type: 'tip' },
];

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({ isOnline: navigator.onLine, lastChecked: new Date() });
  const [currentTip, setCurrentTip] = useState<QuickTip>(QUICK_TIPS[0]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // API-only mode: use browser connectivity signal (no mocked stats).
        setStatus({ isOnline: navigator.onLine, lastChecked: new Date() });
      } catch (error) {
        setStatus({ isOnline: false, lastChecked: new Date() });
      }
    };

    // Check status initially and every 30 seconds
    checkStatus();
    const statusInterval = setInterval(checkStatus, 30000);

    // Rotate quick tips every 10 seconds (if any)
    let tipIndex = 0;
    const tipInterval = QUICK_TIPS.length
      ? setInterval(() => {
          tipIndex = (tipIndex + 1) % QUICK_TIPS.length;
          setCurrentTip(QUICK_TIPS[tipIndex]);
        }, 10000)
      : null;

    return () => {
      clearInterval(statusInterval);
      if (tipInterval) clearInterval(tipInterval);
    };
  }, []);

  return { status, currentTip };
} 