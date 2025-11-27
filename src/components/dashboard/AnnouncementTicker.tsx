
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  author: string;
  createdAt: string;
  isActive: boolean;
}

export const AnnouncementTicker = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'New Patient Portal Launch',
      message: 'The new patient portal is now live! Please inform all patients about the new booking system.',
      priority: 'high',
      author: 'Admin',
      createdAt: '2024-01-16',
      isActive: true
    },
    {
      id: '2',
      title: 'Monthly Staff Meeting',
      message: 'All zone managers are requested to attend the monthly review meeting on Friday at 3 PM.',
      priority: 'medium',
      author: 'HR Team',
      createdAt: '2024-01-15',
      isActive: true
    }
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  const activeAnnouncements = announcements.filter(ann => ann.isActive);

  useEffect(() => {
    if (activeAnnouncements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeAnnouncements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeAnnouncements.length]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return cn(
          "bg-destructive/20 text-destructive",
          "dark:bg-destructive/30 dark:text-destructive-foreground"
        );
      case 'medium':
        return cn(
          "bg-blue-100 text-blue-800",
          "dark:bg-blue-900/30 dark:text-blue-300"
        );
      case 'low':
        return cn(
          "bg-blue-200 text-blue-900",
          "dark:bg-blue-800/30 dark:text-blue-400"
        );
      default:
        return cn(
          "bg-muted text-muted-foreground"
        );
    }
  };

  const currentAnnouncement = activeAnnouncements[currentIndex];

  if (!currentAnnouncement) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">
                {currentAnnouncement.title}
              </h3>
              <Badge className={getPriorityColor(currentAnnouncement.priority)}>
                {currentAnnouncement.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentAnnouncement.message}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{currentAnnouncement.author}</span>
              <span>•</span>
              <span>{currentAnnouncement.createdAt}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
