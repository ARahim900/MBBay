import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { theme, getThemeValue } from '../../lib/theme';

interface SystemHealthIndicatorProps {
  score: number;
}

export const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({ score }) => {
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { 
      status: 'Excellent', 
      color: theme.colors.status.success, 
      bgColor: `${theme.colors.status.success}15`, 
      icon: CheckCircle 
    };
    if (score >= 75) return { 
      status: 'Good', 
      color: theme.colors.status.warning, 
      bgColor: `${theme.colors.status.warning}15`, 
      icon: AlertTriangle 
    };
    if (score >= 60) return { 
      status: 'Fair', 
      color: theme.colors.extended.orange, 
      bgColor: `${theme.colors.extended.orange}15`, 
      icon: AlertTriangle 
    };
    return { 
      status: 'Poor', 
      color: theme.colors.status.error, 
      bgColor: `${theme.colors.status.error}15`, 
      icon: XCircle 
    };
  };

  const health = getHealthStatus(score);
  const Icon = health.icon;

  return (
    <div className="flex items-center" style={{ gap: theme.spacing.lg }}>
      {/* Enhanced circular progress indicator */}
      <div className="relative">
        <div 
          className="relative w-24 h-24 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800"
          style={{ 
            backgroundColor: health.bgColor,
            borderRadius: theme.borderRadius.full,
            boxShadow: theme.shadows.lg
          }}
        >
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke={theme.colors.gray[200]}
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke={health.color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 35}`}
              strokeDashoffset={`${2 * Math.PI * 35 * (1 - score / 100)}`}
              strokeLinecap="round"
              style={{
                transition: `stroke-dashoffset ${theme.animation.duration.slow} ${theme.animation.easing.default}`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </svg>
          
          {/* Center icon with animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="p-2 bg-white dark:bg-gray-800"
              style={{ 
                borderRadius: theme.borderRadius.full,
                boxShadow: theme.shadows.md,
                animation: score >= 90 ? `pulse ${theme.animation.duration.slow} ${theme.animation.easing.default} infinite` : 'none'
              }}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ color: health.color }}
              />
            </div>
          </div>
          
          {/* Percentage text overlay */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div 
              className="bg-white dark:bg-gray-800 px-2 py-1"
              style={{ 
                fontSize: theme.typography.tooltipSize,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.textSecondary,
                borderRadius: theme.borderRadius.full,
                boxShadow: theme.shadows.sm
              }}
            >
              {score.toFixed(0)}%
            </div>
          </div>
        </div>
        
        {/* Animated rings for excellent health */}
        {score >= 90 && (
          <>
            <div 
              className="absolute inset-0 border-2 opacity-20"
              style={{ 
                borderColor: `${theme.colors.status.success}50`,
                borderRadius: theme.borderRadius.full,
                animation: `ping ${theme.animation.duration.slow} ${theme.animation.easing.default} infinite`
              }}
            ></div>
            <div 
              className="absolute inset-0 border opacity-30"
              style={{ 
                borderColor: `${theme.colors.status.success}70`,
                borderRadius: theme.borderRadius.full,
                animation: `pulse ${theme.animation.duration.normal} ${theme.animation.easing.default} infinite`
              }}
            ></div>
          </>
        )}
      </div>
      
      {/* Enhanced text information */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <div 
            style={{ 
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.textPrimary,
              lineHeight: '1',
              fontFamily: theme.typography.fontFamily
            }}
          >
            {score.toFixed(1)}%
          </div>
          <div 
            style={{ 
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: health.color,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {health.status}
            {score >= 90 && <span style={{ fontSize: theme.typography.tooltipSize }}>🎉</span>}
            {score < 60 && <span style={{ fontSize: theme.typography.tooltipSize }}>⚠️</span>}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <div 
            style={{ 
              fontSize: theme.typography.labelSize,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontFamily
            }}
          >
            System Health Score
          </div>
          <div 
            style={{ 
              fontSize: theme.typography.tooltipSize,
              color: theme.colors.gray[500],
              fontFamily: theme.typography.fontFamily
            }}
          >
            Based on compliance metrics
          </div>
        </div>
        
        {/* Health status indicators */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: theme.spacing.sm,
            marginTop: theme.spacing.sm
          }}
        >
          <div 
            style={{
              width: '8px',
              height: '8px',
              borderRadius: theme.borderRadius.full,
              backgroundColor: health.color,
              animation: (score >= 90 || score < 60) ? 
                `pulse ${theme.animation.duration.normal} ${theme.animation.easing.default} infinite` : 
                'none'
            }}
          ></div>
          <span 
            style={{ 
              fontSize: theme.typography.tooltipSize,
              color: theme.colors.gray[500],
              fontFamily: theme.typography.fontFamily
            }}
          >
            {score >= 90 ? 'All systems optimal' :
             score >= 75 ? 'Minor issues detected' :
             score >= 60 ? 'Attention required' :
             'Critical issues present'}
          </span>
        </div>
      </div>
    </div>
  );
};