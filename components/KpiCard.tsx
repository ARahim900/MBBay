import React from 'react';
import { KpiCard as ModernKpiCard } from '../src/components/ui';

interface KpiCardProps {
  title: string;
  value: string;
  subtext: React.ReactNode;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtext, icon }) => {
  return (
    <ModernKpiCard
      title={title}
      value={value}
      subtitle={typeof subtext === 'string' ? subtext : ''}
      icon={icon}
      color="blue"
      variant="default"
    />
  );
};

export default KpiCard;
