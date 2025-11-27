
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'alert' | 'success' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export const AIInsightsPanel = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockInsights: Insight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Revenue Growth Opportunity',
      description: 'Andheri clinic showing 25% higher conversion rate. Consider replicating strategies across Mumbai zone.',
      priority: 'high',
      actionable: true
    },
    {
      id: '2',
      type: 'alert',
      title: 'Patient Wait Time Alert',
      description: 'Bandra clinic average wait time increased to 45 minutes. Recommend staff optimization.',
      priority: 'high',
      actionable: true
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Inventory Optimization',
      description: 'Koramangala clinic inventory turnover is 30% faster. Review procurement schedule.',
      priority: 'medium',
      actionable: true
    },
    {
      id: '4',
      type: 'success',
      title: 'Performance Milestone',
      description: 'West Zone achieved 95% patient satisfaction target this month.',
      priority: 'low',
      actionable: false
    }
  ];

  useEffect(() => {
    setInsights(mockInsights);
  }, []);

  const refreshInsights = () => {
    setIsLoading(true);
    setTimeout(() => {
      setInsights([...mockInsights].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 1000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'recommendation': return <Brain className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-blue-200 text-blue-900';
      case 'success': return 'bg-blue-300 text-blue-950';
      case 'recommendation': return 'bg-blue-400 text-blue-950';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">AI Insights</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-3 border-l-4 ${getPriorityColor(insight.priority)} bg-gray-50 rounded-r-lg`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <Badge className={`text-xs ${getTypeColor(insight.type)}`}>
                  {insight.type}
                </Badge>
              </div>
              <Badge variant="outline" className="text-xs">
                {insight.priority}
              </Badge>
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {insight.title}
            </h4>
            <p className="text-xs text-gray-600 mb-2">
              {insight.description}
            </p>
            {insight.actionable && (
              <Button variant="outline" size="sm" className="text-xs">
                Take Action
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
