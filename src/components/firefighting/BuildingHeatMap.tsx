import React from 'react';
import type { PPMFinding, Equipment } from '../../types/firefighting';
import { theme, getThemeValue } from '../../lib/theme';

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
    
    if (criticalCount > 0) return { level: 'critical', color: theme.colors.status.error };
    if (highCount > 0) return { level: 'high', color: theme.colors.status.warning };
    if (buildingFindings.length > 0) return { level: 'medium', color: theme.colors.status.info };
    return { level: 'low', color: theme.colors.status.success };
  };

  const getBuildingEquipmentCount = (buildingId: string) => {
    return equipment.filter(e => 
      e.location?.location_code === buildingId
    ).length;
  };

  return (
    <div className="w-full space-y-4">
      {/* Heat Map Visualization */}
      <div 
        className="w-full h-80 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden border border-gray-200 dark:border-gray-700"
        style={{ borderRadius: theme.borderRadius.lg }}
      >
        <svg viewBox="0 0 300 200" className="w-full h-full">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke={theme.colors.gridLines} strokeWidth="0.3" opacity="0.5"/>
            </pattern>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {buildings.map((building) => {
            const risk = getBuildingRiskLevel(building.id);
            const equipmentCount = getBuildingEquipmentCount(building.id);
            
            return (
              <g key={building.id}>
                {/* Building shadow */}
                <rect
                  x={building.x + 2}
                  y={building.y + 2}
                  width={building.width}
                  height={building.height}
                  fill="rgba(0,0,0,0.1)"
                  rx={theme.borderRadius.md}
                />
                
                {/* Main building */}
                <rect
                  x={building.x}
                  y={building.y}
                  width={building.width}
                  height={building.height}
                  fill={risk.color}
                  fillOpacity="0.2"
                  stroke={risk.color}
                  strokeWidth="2"
                  rx={theme.borderRadius.md}
                  className="cursor-pointer hover:fill-opacity-40 hover:stroke-width-3 transition-all"
                  style={{ 
                    transitionDuration: theme.animation.duration.normal,
                    transitionTimingFunction: theme.animation.easing.default
                  }}
                  onClick={() => console.log(`Building ${building.id} clicked`)}
                />
                
                {/* Building gradient overlay */}
                <rect
                  x={building.x}
                  y={building.y}
                  width={building.width}
                  height={building.height}
                  fill="url(#buildingGradient)"
                  fillOpacity="0.1"
                  rx={theme.borderRadius.md}
                  className="pointer-events-none"
                />
                
                {/* Building name */}
                <text
                  x={building.x + building.width / 2}
                  y={building.y + building.height / 2 - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                  style={{ 
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.bold,
                    fill: theme.colors.textPrimary,
                    textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                  }}
                >
                  {building.name}
                </text>
                
                {/* Equipment count */}
                <text
                  x={building.x + building.width / 2}
                  y={building.y + building.height / 2 + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                  style={{ 
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    fill: theme.colors.textSecondary
                  }}
                >
                  {equipmentCount} units
                </text>
                
                {/* Critical alert indicator */}
                {risk.level === 'critical' && (
                  <>
                    <circle
                      cx={building.x + building.width - 10}
                      cy={building.y + 10}
                      r="6"
                      fill={theme.colors.status.error}
                      className="animate-pulse"
                    />
                    <circle
                      cx={building.x + building.width - 10}
                      cy={building.y + 10}
                      r="3"
                      fill="white"
                    />
                  </>
                )}
                
                {/* High risk indicator */}
                {risk.level === 'high' && (
                  <polygon
                    points={`${building.x + building.width - 15},${building.y + 5} ${building.x + building.width - 5},${building.y + 5} ${building.x + building.width - 10},${building.y + 15}`}
                    fill={theme.colors.status.warning}
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Interactive tooltip area */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            style={{
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.lg,
              padding: theme.spacing.sm
            }}
          >
            <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
              <div 
                className="mb-1"
                style={{ 
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textPrimary
                }}
              >
                Campus Overview
              </div>
              <div>{buildings.length} Buildings</div>
              <div>{equipment.length} Equipment Units</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Legend */}
      <div 
        className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        style={{
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.lg
        }}
      >
        <div className="flex items-center gap-6">
          <div 
            style={{ 
              fontSize: theme.typography.labelSize,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.textPrimary
            }}
          >
            Risk Levels:
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4"
                style={{
                  backgroundColor: theme.colors.status.success,
                  borderRadius: theme.borderRadius.sm,
                  boxShadow: theme.shadows.sm
                }}
              ></div>
              <span 
                style={{ 
                  fontSize: theme.typography.labelSize,
                  color: theme.colors.textSecondary
                }}
              >
                Low Risk
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4"
                style={{
                  backgroundColor: theme.colors.status.info,
                  borderRadius: theme.borderRadius.sm,
                  boxShadow: theme.shadows.sm
                }}
              ></div>
              <span 
                style={{ 
                  fontSize: theme.typography.labelSize,
                  color: theme.colors.textSecondary
                }}
              >
                Medium
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4"
                style={{
                  backgroundColor: theme.colors.status.warning,
                  borderRadius: theme.borderRadius.sm,
                  boxShadow: theme.shadows.sm
                }}
              ></div>
              <span 
                style={{ 
                  fontSize: theme.typography.labelSize,
                  color: theme.colors.textSecondary
                }}
              >
                High
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 animate-pulse"
                style={{
                  backgroundColor: theme.colors.status.error,
                  borderRadius: theme.borderRadius.sm,
                  boxShadow: theme.shadows.sm
                }}
              ></div>
              <span 
                style={{ 
                  fontSize: theme.typography.labelSize,
                  color: theme.colors.textSecondary
                }}
              >
                Critical
              </span>
            </div>
          </div>
        </div>
        
        <div 
          style={{ 
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.gray[500]
          }}
        >
          Click buildings for detailed information
        </div>
      </div>
    </div>
  );
};