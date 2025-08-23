import React from 'react';
import type { PPMFinding, Equipment } from '../../types/firefighting';

interface BuildingHeatMapProps {
  findings: PPMFinding[];
  equipment: Equipment[];
}

export const BuildingHeatMap: React.FC<BuildingHeatMapProps> = ({ findings, equipment }) => {
  const buildings = [
    { id: 'B1', name: 'Building 1', x: 20, y: 30, width: 60, height: 40 },
    { id: 'B2', name: 'Building 2', x: 100, y: 30, width: 60, height: 40 },
    { id: 'B5', name: 'Building 5', x: 180, y: 30, width: 60, height: 40 },
    { id: 'D44', name: 'D44', x: 20, y: 100, width: 40, height: 30 },
    { id: 'D45', name: 'D45', x: 80, y: 100, width: 40, height: 30 },
    { id: 'FM', name: 'FM Building', x: 140, y: 100, width: 60, height: 30 },
    { id: 'SC', name: 'Sales Center', x: 220, y: 100, width: 50, height: 30 },
    { id: 'PR', name: 'Pump Room', x: 100, y: 150, width: 40, height: 20 }
  ];

  const getBuildingRiskLevel = (buildingId: string) => {
    const buildingFindings = findings.filter(f => 
      f.ppm_record?.location?.location_code === buildingId
    );
    
    const criticalCount = buildingFindings.filter(f => f.severity === 'Critical').length;
    const highCount = buildingFindings.filter(f => f.severity === 'High').length;
    
    if (criticalCount > 0) return { level: 'critical', color: '#DC2626' };
    if (highCount > 0) return { level: 'high', color: '#F59E0B' };
    if (buildingFindings.length > 0) return { level: 'medium', color: '#3B82F6' };
    return { level: 'low', color: '#10B981' };
  };

  const getBuildingEquipmentCount = (buildingId: string) => {
    return equipment.filter(e => 
      e.location?.location_code === buildingId
    ).length;
  };

  return (
    <div className="w-full h-64 relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {buildings.map((building) => {
          const risk = getBuildingRiskLevel(building.id);
          const equipmentCount = getBuildingEquipmentCount(building.id);
          
          return (
            <g key={building.id}>
              <rect
                x={building.x}
                y={building.y}
                width={building.width}
                height={building.height}
                fill={risk.color}
                fillOpacity="0.3"
                stroke={risk.color}
                strokeWidth="2"
                rx="4"
                className="cursor-pointer hover:fill-opacity-50 transition-all"
                onClick={() => console.log(`Building ${building.id} clicked`)}
              />
              
              <text
                x={building.x + building.width / 2}
                y={building.y + building.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-semibold fill-gray-800 dark:fill-white pointer-events-none"
              >
                {building.name}
              </text>
              
              <text
                x={building.x + building.width / 2}
                y={building.y + building.height / 2 + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-600 dark:fill-gray-300 pointer-events-none"
              >
                {equipmentCount} units
              </text>
              
              {risk.level === 'critical' && (
                <circle
                  cx={building.x + building.width - 8}
                  cy={building.y + 8}
                  r="4"
                  fill="#DC2626"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>
      
      <div className="absolute bottom-2 left-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-300">Low Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-300">Medium Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-300">High Risk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-300">Critical</span>
        </div>
      </div>
    </div>
  );
};