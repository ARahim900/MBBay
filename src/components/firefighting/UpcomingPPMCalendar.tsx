import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface UpcomingPPMCalendarProps {
  upcomingCount: number;
}

export const UpcomingPPMCalendar: React.FC<UpcomingPPMCalendarProps> = ({ upcomingCount }) => {
  const upcomingPPMs = [
    {
      id: 1,
      location: 'Building 1 - Fire Panel',
      type: 'Quarterly',
      date: '2024-01-15',
      inspector: 'Ahmad Al-Rashid',
      priority: 'high'
    },
    {
      id: 2,
      location: 'D44 - Smoke Detectors',
      type: 'Bi-Annual',
      date: '2024-01-18',
      inspector: 'Sara Mohamed',
      priority: 'medium'
    },
    {
      id: 3,
      location: 'Pump Room - Fire Pumps',
      type: 'Annual',
      date: '2024-01-22',
      inspector: 'Omar Hassan',
      priority: 'high'
    },
    {
      id: 4,
      location: 'Sales Center - Sprinklers',
      type: 'Quarterly',
      date: '2024-01-25',
      inspector: 'Fatima Ali',
      priority: 'low'
    },
    {
      id: 5,
      location: 'FM Building - Fire Extinguishers',
      type: 'Quarterly',
      date: '2024-01-28',
      inspector: 'Hassan Al-Balushi',
      priority: 'medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4" />
          <span>{upcomingCount} inspections scheduled this month</span>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {upcomingPPMs.map((ppm) => {
          const daysUntil = getDaysUntil(ppm.date);
          const isOverdue = daysUntil < 0;
          const isToday = daysUntil === 0;
          const isTomorrow = daysUntil === 1;

          return (
            <div
              key={ppm.id}
              className={`p-3 rounded-lg border-l-4 ${getPriorityColor(ppm.priority)} cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityDot(ppm.priority)}`} />
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {ppm.location}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{ppm.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{ppm.inspector}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xs font-medium ${
                    isOverdue ? 'text-red-600' :
                    isToday ? 'text-orange-600' :
                    isTomorrow ? 'text-yellow-600' :
                    'text-gray-600 dark:text-gray-300'
                  }`}>
                    {isOverdue ? `${Math.abs(daysUntil)} days overdue` :
                     isToday ? 'Today' :
                     isTomorrow ? 'Tomorrow' :
                     `${daysUntil} days`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(ppm.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-3">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          View Full Calendar
        </button>
      </div>
    </div>
  );
};