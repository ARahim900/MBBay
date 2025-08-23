import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { PPMRecord, PPMLocation } from '../../types/firefighting';

interface PPMScheduleViewProps {
  locations: PPMLocation[];
  onNewInspection: () => void;
  onEditRecord: (record: PPMRecord) => void;
}

export const PPMScheduleView: React.FC<PPMScheduleViewProps> = ({
  locations,
  onNewInspection,
  onEditRecord
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const mockScheduledInspections = [
    {
      id: 1,
      location_id: 1,
      ppm_date: '2024-01-15',
      ppm_type: 'Quarterly' as const,
      inspector_name: 'Ahmad Al-Rashid',
      overall_status: 'Pending' as const,
      notes: '',
      location: locations.find(l => l.id === 1)
    },
    {
      id: 2,
      location_id: 4,
      ppm_date: '2024-01-18',
      ppm_type: 'Bi-Annual' as const,
      inspector_name: 'Sara Mohamed',
      overall_status: 'Pending' as const,
      notes: '',
      location: locations.find(l => l.id === 4)
    },
    {
      id: 3,
      location_id: 8,
      ppm_date: '2024-01-22',
      ppm_type: 'Annual' as const,
      inspector_name: 'Omar Hassan',
      overall_status: 'Pending' as const,
      notes: '',
      location: locations.find(l => l.id === 8)
    },
    {
      id: 4,
      location_id: 7,
      ppm_date: '2024-01-25',
      ppm_type: 'Quarterly' as const,
      inspector_name: 'Fatima Ali',
      overall_status: 'Completed' as const,
      notes: 'All systems operational',
      location: locations.find(l => l.id === 7)
    },
    {
      id: 5,
      location_id: 6,
      ppm_date: '2024-01-28',
      ppm_type: 'Quarterly' as const,
      inspector_name: 'Hassan Al-Balushi',
      overall_status: 'Pending' as const,
      notes: '',
      location: locations.find(l => l.id === 6)
    }
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getInspectionsForDate = (date: string) => {
    return mockScheduledInspections.filter(inspection => inspection.ppm_date === date);
  };

  const isToday = (date: number) => {
    const today = new Date();
    return today.getDate() === date && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'Annual': return 'bg-red-500';
      case 'Bi-Annual': return 'bg-orange-500';
      case 'Quarterly': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'border-green-500';
      case 'Pending': return 'border-yellow-500';
      case 'Failed': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 dark:bg-gray-900"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const inspections = getInspectionsForDate(dateString);
      const isCurrentDay = isToday(day);

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-1 ${
            isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : 'bg-white dark:bg-gray-800'
          } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {inspections.slice(0, 2).map((inspection) => (
              <div
                key={inspection.id}
                onClick={() => onEditRecord(inspection)}
                className={`text-xs p-1 rounded border-l-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${getStatusColor(inspection.overall_status)}`}
              >
                <div className={`w-2 h-2 rounded-full inline-block mr-1 ${getPriorityColor(inspection.ppm_type)}`}></div>
                <span className="truncate">{inspection.location?.location_code}</span>
              </div>
            ))}
            {inspections.length > 2 && (
              <div className="text-xs text-gray-500">+{inspections.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">
            PPM Schedule - {formatDate(currentDate)}
          </h3>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === 'month'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === 'week'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Week
            </button>
          </div>
          <Button onClick={onNewInspection} className="bg-red-500 hover:bg-red-600">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Inspection
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">
            Upcoming Inspections
          </h4>
          <div className="space-y-3">
            {mockScheduledInspections
              .filter(inspection => new Date(inspection.ppm_date) >= new Date())
              .slice(0, 5)
              .map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(inspection.ppm_type)}`}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {inspection.location?.location_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(inspection.ppm_date).toLocaleDateString()}</span>
                        <User className="h-3 w-3 ml-2" />
                        <span>{inspection.inspector_name}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {inspection.ppm_type}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">
            Legend
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Annual Inspection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Bi-Annual Inspection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Quarterly Inspection</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-yellow-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-red-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Failed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};