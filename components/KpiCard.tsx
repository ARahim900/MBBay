import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtext: React.ReactNode;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtext, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 transform hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="text-sm mt-1">{subtext}</div>
        </div>
        {icon}
      </div>
    </div>
  );
};

export default KpiCard;
