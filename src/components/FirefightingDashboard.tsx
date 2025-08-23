import React, { useState, useEffect } from 'react';
import { Flame, AlertTriangle, CheckCircle, XCircle, TrendingUp, Calendar, MapPin, Settings, RefreshCw, Bell, Download, LayoutDashboard, Database, PieChart } from 'lucide-react';
import { MenuBar } from './ui/glow-menu';
import { FirefightingAPI } from '../lib/firefighting-api';
import type { FirefightingDashboardStats, PPMFinding, Equipment, FirefightingAlert } from '../types/firefighting';
import { SystemHealthIndicator } from './firefighting/SystemHealthIndicator';
import { BuildingHeatMap } from './firefighting/BuildingHeatMap';
import { FindingsTable } from './firefighting/FindingsTable';
import { UpcomingPPMCalendar } from './firefighting/UpcomingPPMCalendar';
import { MetricCard } from './firefighting/MetricCard';
import { EquipmentManagement } from './firefighting/EquipmentManagement';
import { PPMManagement } from './firefighting/PPMManagement';

// Card Component matching the existing design
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), Math.random() * 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-white/10 p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 ${isMounted ? 'fade-in-up' : 'opacity-0 translate-y-4'} ${className}`}>
      {children}
    </div>
  );
};

// Button Component matching the existing design
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', ...props }: any) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200';
  const variants = {
    default: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg active:scale-95',
    outline: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg active:scale-95'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

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
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A181F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading firefighting system data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1A181F] flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="bg-red-500 hover:bg-red-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Menu items matching the existing pattern
  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(220,38,38,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(220,38,38,0) 100%)",
      iconColor: "text-red-500"
    },
    { 
      icon: Settings, 
      label: 'Equipment', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.06) 50%, rgba(59,130,246,0) 100%)",
      iconColor: "text-blue-500"
    },
    { 
      icon: Calendar, 
      label: 'PPM Management', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.06) 50%, rgba(34,197,94,0) 100%)",
      iconColor: "text-green-500"
    },
    { 
      icon: AlertTriangle, 
      label: 'Findings', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.06) 50%, rgba(245,158,11,0) 100%)",
      iconColor: "text-amber-500"
    },
    { 
      icon: PieChart, 
      label: 'Reports', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.06) 50%, rgba(139,92,246,0) 100%)",
      iconColor: "text-purple-500"
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
            <div className="text-center p-8">
              <PieChart className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reports Module</h3>
              <p className="text-gray-600 dark:text-gray-300">Advanced reporting and analytics coming soon...</p>
            </div>
          </Card>
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      <Card>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SystemHealthIndicator score={stats.complianceRate} />
            <div>
              <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">System Health Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Overall compliance: {stats.complianceRate.toFixed(1)}%
              </p>
            </div>
          </div>
          
          {alerts.length > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <Bell className="h-5 w-5 animate-pulse" />
              <span className="font-medium">{alerts.length} Active Alerts</span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="PPM Compliance"
          value={`${stats.complianceRate.toFixed(1)}%`}
          trend="+5%"
          color="green"
          icon={CheckCircle}
        />
        <MetricCard 
          title="Open Findings"
          value={findings.length.toString()}
          subtext={`${stats.criticalFindings} Critical`}
          color="amber"
          icon={AlertTriangle}
        />
        <MetricCard 
          title="Equipment Health"
          value={`${((stats.activeEquipment / stats.totalEquipment) * 100).toFixed(1)}%`}
          subtext={`${stats.faultyEquipment} Faulty`}
          color={stats.faultyEquipment > 0 ? "red" : "green"}
          icon={stats.faultyEquipment > 0 ? XCircle : CheckCircle}
        />
        <MetricCard 
          title="Monthly Cost"
          value={`OMR ${stats.monthlyPPMCost.toLocaleString()}`}
          trend="+12%"
          color="blue"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Building Heat Map
            </h3>
            <BuildingHeatMap findings={findings} equipment={equipment} />
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Inspections
            </h3>
            <UpcomingPPMCalendar upcomingCount={stats.upcomingInspections} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Critical Findings
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveSubModule('Findings')}
            >
              View All
            </Button>
          </div>
          <FindingsTable 
            findings={findings.slice(0, 5)} 
            showPagination={false}
            compact={true}
          />
        </div>
      </Card>

      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Active Alerts
            </h3>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'Critical' ? 'bg-red-500' :
                      alert.severity === 'High' ? 'bg-orange-500' :
                      alert.severity === 'Medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    } animate-pulse`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{alert.alert_type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#4E4456] dark:text-white">Firefighting & Alarm System</h2>
        <p className="text-sm text-gray-500">Muscat Bay Safety Management</p>
      </div>
      
      <div className="mb-6 flex justify-center">
        <MenuBar
          items={menuItems}
          activeItem={activeSubModule}
          onItemClick={(label) => setActiveSubModule(label)}
          className="w-fit"
        />
      </div>
      
      {renderSubModule()}
    </div>
  );
};