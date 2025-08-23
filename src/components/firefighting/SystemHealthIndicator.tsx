import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SystemHealthIndicatorProps {
  score: number;
}

export const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({ score }) => {
  const getHealthStatus = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: 'text-green-500', bgColor: 'bg-green-100', icon: CheckCircle };
    if (score >= 75) return { status: 'Good', color: 'text-yellow-500', bgColor: 'bg-yellow-100', icon: AlertTriangle };
    if (score >= 60) return { status: 'Fair', color: 'text-orange-500', bgColor: 'bg-orange-100', icon: AlertTriangle };
    return { status: 'Poor', color: 'text-red-500', bgColor: 'bg-red-100', icon: XCircle };
  };

  const health = getHealthStatus(score);
  const Icon = health.icon;

  return (
    <div className="flex items-center gap-4">
      <div className={`relative w-20 h-20 ${health.bgColor} rounded-full flex items-center justify-center`}>
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            className={health.color}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-6 h-6 ${health.color}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {score.toFixed(1)}%
        </div>
        <div className={`text-sm font-medium ${health.color}`}>
          {health.status}
        </div>
        <div className="text-xs text-gray-500">
          System Health
        </div>
      </div>
    </div>
  );
};