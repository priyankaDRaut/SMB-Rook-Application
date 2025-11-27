
import React, { useState } from 'react';
import { Search, Building2, Users, UserCheck, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  type: 'clinic' | 'doctor' | 'patient' | 'zone';
  subtitle?: string;
  location?: string;
}

export const GlobalSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Mock search results - replace with actual API call
  const mockSearch = (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const allResults: SearchResult[] = [
      { id: '1', title: 'Smilebird Andheri', type: 'clinic', subtitle: 'Mumbai', location: 'West Zone' },
      { id: '2', title: 'Dr. Sharma', type: 'doctor', subtitle: 'Orthodontist', location: 'Andheri' },
      { id: '3', title: 'John Doe', type: 'patient', subtitle: 'Regular checkup', location: 'Andheri' },
      { id: '4', title: 'West Zone', type: 'zone', subtitle: '5 clinics', location: 'Mumbai Region' },
    ];

    const filtered = allResults.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle?.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setIsSearching(true);
    mockSearch(value);
    setTimeout(() => setIsSearching(false), 300);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'clinic': return <Building2 className="h-4 w-4" />;
      case 'doctor': return <UserCheck className="h-4 w-4" />;
      case 'patient': return <Users className="h-4 w-4" />;
      case 'zone': return <MapPin className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      clinic: 'bg-blue-100 text-blue-800',
      doctor: 'bg-blue-200 text-blue-900',
      patient: 'bg-blue-300 text-blue-950',
      staff: 'bg-blue-400 text-blue-950'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-blue-100 text-blue-800'}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search clinics, doctors, patients..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {searchQuery && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="text-blue-600">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      {getTypeBadge(result.type)}
                    </div>
                    {result.subtitle && (
                      <p className="text-xs text-gray-500 truncate">
                        {result.subtitle} • {result.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
