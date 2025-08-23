import React, { useState, useEffect } from 'react';
import { Flame, AlertTriangle, CheckCircle, XCircle, TrendingUp, Calendar, MapPin, Settings, RefreshCw, Bell, Download, LayoutDashboard } from 'lucide-react';
import { Card, KpiCard, Button } from './ui';
import { FirefightingAPI } from '../lib/firefighting-api';
import type { FirefightingDashboardStats, PPMFinding, Equipment, FirefightingAlert } from '../types/firefighting';
import { SystemHealthIndicator } from './firefighting/SystemHealthIndicator';
import { BuildingHeatMap } from './firefighting/BuildingHeatMap';
import { FindingsTable } from './firefighting/FindingsTable';
import { UpcomingPPMCalendar } from './firefighting/UpcomingPPMCalendar';
import { MetricCard } from './firefighting/MetricCard';
import { EquipmentManagement } from './firefighting/EquipmentManagement';
import { PPMManagement } from './firefighting/PPMManagement';

export const FirefightingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'equipment' | 'ppm' | 'findings' | 'reports'>('dashboard');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'equipment':
        return <EquipmentManagement />;
      case 'ppm':
        return <PPMManagement />;
      case 'findings':
        return <FindingsTable findings={findings} showPagination={true} />;
      case 'reports':
        return <div>Reports module coming soon...</div>;
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
              onClick={() => setActiveTab('findings')}
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4E4456] dark:text-white flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Flame className="h-8 w-8 text-red-500" />
            </div>
            Firefighting & Alarm System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive safety monitoring and maintenance management
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={handleExportReport}
            className="bg-red-500 hover:bg-red-600 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'equipment', label: 'Equipment', icon: Settings },
          { id: 'ppm', label: 'PPM', icon: Calendar },
          { id: 'findings', label: 'Findings', icon: AlertTriangle },
          { id: 'reports', label: 'Reports', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderContent()}
    </div>
  );
};