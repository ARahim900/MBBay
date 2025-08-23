import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Calendar, MapPin, Settings, RefreshCw, Bell, Download, LayoutDashboard, PieChart } from 'lucide-react';
import { MenuBar } from './ui/glow-menu';
import { Card, KpiCard, Button } from './ui';
import { FirefightingAPI } from '../lib/firefighting-api';
import type { FirefightingDashboardStats, PPMFinding, Equipment, FirefightingAlert } from '../types/firefighting';
import { getThemeValue } from '../lib/theme';
import { SystemHealthIndicator } from './firefighting/SystemHealthIndicator';
import { BuildingHeatMap } from './firefighting/BuildingHeatMap';
import { FindingsTable } from './firefighting/FindingsTable';
import { UpcomingPPMCalendar } from './firefighting/UpcomingPPMCalendar';
import { EquipmentManagement } from './firefighting/EquipmentManagement';
import { PPMManagement } from './firefighting/PPMManagement';

export const FirefightingDashboard: React.FC = () => {
  const [activeSubModule, setActiveSubModule] = useState('Dashboard');
  const [stats, setStats] = useState<FirefightingDashboardStats>({
    totalEquipment: 0,
    activeEquipment: 0,
    faultyEquipment: 0,
    criticalFindings: 0,
    pendingPPMs: 0,
    complianceRate: 0,
    monthlyPPMCost: 0,
    upcomingInspections: 0
  });
  
  const [findings, setFindings] = useState<PPMFinding[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [alerts, setAlerts] = useState<FirefightingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDashboard();
    subscribeToUpdates();
    
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      await fetchDashboardData();
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [dashboardStats, criticalFindings, equipmentData, activeAlerts] = await Promise.all([
        FirefightingAPI.getDashboardStats(),
        FirefightingAPI.getCriticalFindings(),
        FirefightingAPI.getEquipment(),
        FirefightingAPI.getActiveAlerts()
      ]);

      setStats(dashboardStats);
      setFindings(criticalFindings);
      setEquipment(equipmentData);
      setAlerts(activeAlerts);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    }
  };

  const subscribeToUpdates = () => {
    const unsubscribe = FirefightingAPI.subscribeToRealTimeUpdates((payload) => {
      console.log('Real-time update received:', payload);
      
      if (payload.eventType === 'INSERT' && payload.table === 'ppm_findings') {
        const newFinding = payload.new as PPMFinding;
        if (newFinding.severity === 'Critical') {
          setFindings(prev => [newFinding, ...prev]);
          
          const newAlert: FirefightingAlert = {
            id: Date.now(),
            alert_type: 'Critical Finding',
            severity: 'Critical',
            message: `Critical finding detected: ${newFinding.finding_description}`,
            created_at: new Date().toISOString(),
            acknowledged: false,
            resolved: false
          };
          setAlerts(prev => [newAlert, ...prev]);
        }
      }
    });

    return unsubscribe;
  };

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  const handleExportReport = async () => {
    try {
      const report = await FirefightingAPI.generateComplianceReport({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      });
      
      const dataStr = JSON.stringify(report, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `firefighting-compliance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: getThemeValue('colors.status.error', '#ef4444') }}></div>
          <p 
            className="mt-4 dark:text-gray-300"
            style={{ 
              color: getThemeValue('colors.textSecondary', '#6B7280'),
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Loading firefighting system data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <div className="text-center" style={{ color: getThemeValue('colors.status.error', '#ef4444') }}>
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 
              className="mb-2"
              style={{ 
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Error Loading Dashboard
            </h3>
            <p 
              className="mb-4"
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                color: getThemeValue('colors.textSecondary', '#6B7280'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              {error}
            </p>
            <Button onClick={handleRefresh} variant="primary" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Menu items matching the existing pattern with proper theme integration
  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.status.error', '#ef4444')}15 0%, ${getThemeValue('colors.status.error', '#ef4444')}06 50%, ${getThemeValue('colors.status.error', '#ef4444')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.status.error', '#ef4444')}]`
    },
    { 
      icon: Settings, 
      label: 'Equipment', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.status.info', '#3b82f6')}15 0%, ${getThemeValue('colors.status.info', '#3b82f6')}06 50%, ${getThemeValue('colors.status.info', '#3b82f6')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.status.info', '#3b82f6')}]`
    },
    { 
      icon: Calendar, 
      label: 'PPM Management', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.status.success', '#10b981')}15 0%, ${getThemeValue('colors.status.success', '#10b981')}06 50%, ${getThemeValue('colors.status.success', '#10b981')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.status.success', '#10b981')}]`
    },
    { 
      icon: AlertTriangle, 
      label: 'Findings', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.status.warning', '#f59e0b')}15 0%, ${getThemeValue('colors.status.warning', '#f59e0b')}06 50%, ${getThemeValue('colors.status.warning', '#f59e0b')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.status.warning', '#f59e0b')}]`
    },
    { 
      icon: PieChart, 
      label: 'Reports', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.extended.purple', '#8b5cf6')}15 0%, ${getThemeValue('colors.extended.purple', '#8b5cf6')}06 50%, ${getThemeValue('colors.extended.purple', '#8b5cf6')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.extended.purple', '#8b5cf6')}]`
    },
  ];

  const renderSubModule = () => {
    switch (activeSubModule) {
      case 'Dashboard':
        return renderDashboard();
      case 'Equipment':
        return <EquipmentManagement />;
      case 'PPM Management':
        return <PPMManagement />;
      case 'Findings':
        return <FindingsTable findings={findings} showPagination={true} compact={false} />;
      case 'Reports':
        return (
          <Card>
            <div className="text-center p-6 md:p-8">
              <PieChart className="h-12 w-12 md:h-16 md:w-16 text-purple-500 mx-auto mb-4" />
              <h3 
                className="mb-2 dark:text-white"
                style={{ 
                  fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                  fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                  color: getThemeValue('colors.textPrimary', '#111827'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Reports Module
              </h3>
              <p 
                className="dark:text-gray-300"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  color: getThemeValue('colors.textSecondary', '#6B7280'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Advanced reporting and analytics coming soon...
              </p>
            </div>
          </Card>
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* System Health Overview - Aligned with enhanced module patterns */}
      <Card>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            <div className="flex-shrink-0">
              <SystemHealthIndicator score={stats.complianceRate} />
            </div>
            <div className="space-y-1">
              <h3 
                className="dark:text-white"
                style={{ 
                  fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                  fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                  color: getThemeValue('colors.textPrimary', '#111827'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                System Health Status
              </h3>
              <p 
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  color: getThemeValue('colors.gray.500', '#6b7280'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Overall compliance: <span 
                  style={{ 
                    fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                    color: getThemeValue('colors.status.success', '#10b981')
                  }}
                >
                  {stats.complianceRate.toFixed(1)}%
                </span>
              </p>
              <p 
                style={{ 
                  fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                  color: getThemeValue('colors.gray.400', '#9ca3af'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
          
          {alerts.length > 0 && (
            <div 
              className="flex items-center gap-2" 
              style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
            >
              <Bell className="h-5 w-5 animate-pulse" />
              <span 
                style={{ 
                  fontWeight: getThemeValue('typography.fontWeight.medium', '500'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                {alerts.length} Active Alerts
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* KPI Metrics - Consistent grid with theme spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="PPM Compliance"
          value={`${stats.complianceRate.toFixed(1)}%`}
          trend={{ value: 5, isPositive: true, period: 'vs last month' }}
          color="green"
          icon={CheckCircle}
        />
        <KpiCard 
          title="Open Findings"
          value={findings.length.toString()}
          subtitle={`${stats.criticalFindings} Critical`}
          color="orange"
          icon={AlertTriangle}
        />
        <KpiCard 
          title="Equipment Health"
          value={`${((stats.activeEquipment / stats.totalEquipment) * 100).toFixed(1)}%`}
          subtitle={`${stats.faultyEquipment} Faulty`}
          color={stats.faultyEquipment > 0 ? "pink" : "green"}
          icon={stats.faultyEquipment > 0 ? XCircle : CheckCircle}
        />
        <KpiCard 
          title="Monthly Cost"
          value={`OMR ${stats.monthlyPPMCost.toLocaleString()}`}
          trend={{ value: 12, isPositive: true, period: 'vs last month' }}
          color="blue"
          icon={TrendingUp}
        />
      </div>

      {/* Visual Components - Aligned grid with consistent spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 
            className="mb-4 flex items-center gap-2 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <MapPin className="h-5 w-5" />
            Building Heat Map
          </h3>
          <BuildingHeatMap findings={findings} equipment={equipment} />
        </Card>
        
        <Card>
          <h3 
            className="mb-4 flex items-center gap-2 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <Calendar className="h-5 w-5" />
            Upcoming Inspections
          </h3>
          <UpcomingPPMCalendar upcomingCount={stats.upcomingInspections} />
        </Card>
      </div>

      {/* Critical Findings - Consistent table layout */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 
            className="flex items-center gap-2 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: getThemeValue('colors.status.error', '#ef4444') }} />
            Critical Findings
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveSubModule('Findings')}
            className="w-fit"
          >
            View All
          </Button>
        </div>
        <FindingsTable 
          findings={findings.slice(0, 5)} 
          showPagination={false}
          compact={true}
        />
      </Card>

      {/* Active Alerts - Responsive alert layout */}
      {alerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
          <h3 
            className="mb-4 flex items-center gap-2"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.status.error', '#ef4444'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <Bell className="h-5 w-5" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div 
                    className={`w-3 h-3 rounded-full animate-pulse flex-shrink-0 ${
                      alert.severity === 'Critical' ? 'bg-red-500' :
                      alert.severity === 'High' ? 'bg-yellow-500' :
                      alert.severity === 'Medium' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{alert.alert_type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-300 text-red-500 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 flex-shrink-0"
                >
                  Acknowledge
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section - Aligned with enhanced module patterns */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-1">
          <h2 
            className="dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.2xl', '1.5rem'),
              fontWeight: getThemeValue('typography.fontWeight.bold', '700'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Firefighting & Alarm System
          </h2>
          <p 
            className="text-sm text-gray-500 dark:text-gray-400"
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              color: getThemeValue('colors.gray.500', '#6b7280'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Muscat Bay Safety Management
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={handleExportReport}
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Report</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu - Centered with consistent spacing */}
      <div className="flex justify-center">
        <MenuBar
          items={menuItems}
          activeItem={activeSubModule}
          onItemClick={(label) => setActiveSubModule(label)}
          className="w-fit"
        />
      </div>
      
      {/* Main Content - Consistent spacing */}
      <div className="min-h-[400px]">
        {renderSubModule()}
      </div>
    </div>
  );
};