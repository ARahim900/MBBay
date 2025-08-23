import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { theme, getThemeValue } from '../../lib/theme';

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

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.status.error;
      case 'medium': return theme.colors.status.warning;
      case 'low': return theme.colors.status.success;
      default: return theme.colors.gray[500];
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
    <Card className="space-y-6" padding="lg">
      {/* Header with summary */}
      <div 
        className="flex items-center justify-between bg-gradient-to-r border"
        style={{
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.lg,
          background: `linear-gradient(to right, ${theme.colors.status.info}08, ${theme.colors.primary}08)`,
          borderColor: `${theme.colors.status.info}33`
        }}
      >
        <div className="flex items-center" style={{ gap: theme.spacing.sm }}>
          <div 
            className="p-2"
            style={{ 
              borderRadius: theme.borderRadius.lg,
              backgroundColor: `${theme.colors.status.info}15` 
            }}
          >
            <Clock className="h-5 w-5" style={{ color: theme.colors.primary }} />
          </div>
          <div>
            <div 
              style={{ 
                fontSize: theme.typography.labelSize,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.status.info,
                fontFamily: theme.typography.fontFamily
              }}
            >
              {upcomingCount} Inspections Scheduled
            </div>
            <div 
              style={{ 
                fontSize: theme.typography.tooltipSize,
                color: `${theme.colors.status.info}CC`,
                fontFamily: theme.typography.fontFamily
              }}
            >
              This month
            </div>
          </div>
        </div>
        <div className="text-right">
          <div 
            style={{ 
              fontSize: theme.typography.titleSize,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.status.info,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {upcomingPPMs.filter(ppm => getDaysUntil(ppm.date) <= 7).length}
          </div>
          <div 
            style={{ 
              fontSize: theme.typography.tooltipSize,
              color: `${theme.colors.status.info}CC`,
              fontFamily: theme.typography.fontFamily
            }}
          >
            Next 7 days
          </div>
        </div>
      </div>

      {/* Inspection list */}
      <div className="max-h-80 overflow-y-auto pr-2" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        {upcomingPPMs.map((ppm) => {
          const daysUntil = getDaysUntil(ppm.date);
          const isOverdue = daysUntil < 0;
          const isToday = daysUntil === 0;
          const isTomorrow = daysUntil === 1;
          const isUrgent = daysUntil <= 3 && daysUntil >= 0;

          return (
            <div
              key={ppm.id}
              className="border-l-4 cursor-pointer hover:-translate-y-1 transition-all group"
              style={{
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.lg,
                transitionDuration: theme.animation.duration.normal,
                borderLeftColor: 
                  ppm.priority === 'high' ? theme.colors.status.error :
                  ppm.priority === 'medium' ? theme.colors.status.warning :
                  ppm.priority === 'low' ? theme.colors.status.success :
                  theme.colors.gray[500],
                backgroundColor: 
                  ppm.priority === 'high' ? `${theme.colors.status.error}08` :
                  ppm.priority === 'medium' ? `${theme.colors.status.warning}08` :
                  ppm.priority === 'low' ? `${theme.colors.status.success}08` :
                  `${theme.colors.gray[500]}08`,
                boxShadow: isOverdue ? `0 0 0 2px ${theme.colors.status.error}20` :
                          isToday ? `0 0 0 2px ${theme.colors.status.warning}20` :
                          theme.shadows.sm
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = theme.shadows.lg}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = isOverdue ? `0 0 0 2px ${theme.colors.status.error}20` :
                                                   isToday ? `0 0 0 2px ${theme.colors.status.warning}20` :
                                                   theme.shadows.sm;
              }}
            >
              <div className="flex items-start justify-between" style={{ gap: theme.spacing.md }}>
                <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                  {/* Location and priority */}
                  <div className="flex items-center" style={{ gap: theme.spacing.sm }}>
                    <div 
                      className="w-3 h-3 rounded-full group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: getPriorityDot(ppm.priority) }}
                    />
                    <h4 
                      className="font-semibold transition-colors"
                      style={{ 
                        fontSize: theme.typography.labelSize,
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: theme.typography.fontWeight.semibold
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.textPrimary}
                    >
                      {ppm.location}
                    </h4>
                    {isOverdue && (
                      <span 
                        className="px-2 py-1 rounded-full font-medium"
                        style={{ 
                          fontSize: theme.typography.tooltipSize,
                          backgroundColor: `${theme.colors.status.error}15`,
                          color: theme.colors.status.error,
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: theme.typography.fontWeight.medium,
                          borderRadius: theme.borderRadius.full
                        }}
                      >
                        OVERDUE
                      </span>
                    )}
                    {isToday && (
                      <span 
                        className="px-2 py-1 rounded-full font-medium animate-pulse"
                        style={{ 
                          fontSize: theme.typography.tooltipSize,
                          backgroundColor: `${theme.colors.status.warning}15`,
                          color: theme.colors.status.warning,
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: theme.typography.fontWeight.medium,
                          borderRadius: theme.borderRadius.full
                        }}
                      >
                        TODAY
                      </span>
                    )}
                    {isUrgent && !isToday && (
                      <span 
                        className="px-2 py-1 rounded-full font-medium"
                        style={{ 
                          fontSize: theme.typography.tooltipSize,
                          backgroundColor: `${theme.colors.extended.orange}15`,
                          color: theme.colors.extended.orange,
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: theme.typography.fontWeight.medium,
                          borderRadius: theme.borderRadius.full
                        }}
                      >
                        URGENT
                      </span>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div 
                    className="flex items-center gap-6 dark:text-gray-300"
                    style={{ 
                      fontSize: theme.typography.tooltipSize,
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontFamily
                    }}
                  >
                    <div className="flex items-center" style={{ gap: theme.spacing.xs }}>
                      <Calendar className="h-3 w-3" />
                      <span style={{ fontWeight: theme.typography.fontWeight.medium }}>{ppm.type}</span>
                    </div>
                    <div className="flex items-center" style={{ gap: theme.spacing.xs }}>
                      <User className="h-3 w-3" />
                      <span>{ppm.inspector}</span>
                    </div>
                  </div>
                </div>
                
                {/* Date and countdown */}
                <div className="text-right space-y-1">
                  <div 
                    style={{
                      fontSize: theme.typography.labelSize,
                      fontWeight: theme.typography.fontWeight.bold,
                      fontFamily: theme.typography.fontFamily,
                      color: isOverdue ? theme.colors.status.error :
                             isToday ? theme.colors.status.warning :
                             isTomorrow ? theme.colors.status.warning :
                             isUrgent ? theme.colors.extended.orange :
                             theme.colors.textSecondary
                    }}
                    className="dark:text-gray-300"
                  >
                    {isOverdue ? `${Math.abs(daysUntil)} days overdue` :
                     isToday ? 'Today' :
                     isTomorrow ? 'Tomorrow' :
                     `${daysUntil} days`}
                  </div>
                  <div 
                    style={{ 
                      fontSize: theme.typography.tooltipSize,
                      color: theme.colors.gray[500],
                      fontWeight: theme.typography.fontWeight.medium,
                      fontFamily: theme.typography.fontFamily
                    }}
                  >
                    {new Date(ppm.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div 
        className="border-t dark:border-gray-700"
        style={{ 
          borderColor: theme.colors.gray[200],
          paddingTop: theme.spacing.md,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.sm
        }}
      >
        <div 
          className="flex items-center justify-between"
          style={{ 
            fontSize: theme.typography.tooltipSize,
            color: theme.colors.gray[500],
            fontFamily: theme.typography.fontFamily
          }}
        >
          <span>
            {upcomingPPMs.filter(ppm => getDaysUntil(ppm.date) < 0).length} overdue, 
            {upcomingPPMs.filter(ppm => getDaysUntil(ppm.date) <= 7 && getDaysUntil(ppm.date) >= 0).length} upcoming
          </span>
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="md" 
          fullWidth
          className="font-medium text-blue-500 hover:text-blue-600"
          style={{
            fontFamily: theme.typography.fontFamily,
            fontWeight: theme.typography.fontWeight.medium
          }}
        >
          View Full Calendar & Schedule
        </Button>
      </div>
    </Card>
  );
};