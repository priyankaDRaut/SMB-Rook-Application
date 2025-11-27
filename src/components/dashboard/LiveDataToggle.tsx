
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Radio, Clock, RefreshCw } from 'lucide-react';

interface LiveDataToggleProps {
  onLiveModeChange: (isLive: boolean) => void;
}

export const LiveDataToggle = ({ onLiveModeChange }: LiveDataToggleProps) => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [nextUpdate, setNextUpdate] = useState(5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLiveMode) {
      interval = setInterval(() => {
        setLastUpdate(new Date());
        setNextUpdate(5);
        
        // Countdown timer
        const countdown = setInterval(() => {
          setNextUpdate(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 5;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(countdown);
      }, 300000); // 5 minutes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveMode]);

  const handleToggle = (checked: boolean) => {
    setIsLiveMode(checked);
    onLiveModeChange(checked);
    if (checked) {
      setLastUpdate(new Date());
      setNextUpdate(5);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center space-x-2">
          <Radio className={`h-4 w-4 ${isLiveMode ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          <span>Live Data Mode</span>
          {isLiveMode && (
            <Badge className="bg-red-100 text-red-800 text-xs">
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Auto-refresh KPIs</span>
          <Switch checked={isLiveMode} onCheckedChange={handleToggle} />
        </div>
        
        {isLiveMode && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Last update:</span>
              </div>
              <span>{formatTime(lastUpdate)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <RefreshCw className="h-3 w-3" />
                <span>Next update in:</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {nextUpdate}:00
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
