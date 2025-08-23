import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Filter, Search, FileText, AlertTriangle } from 'lucide-react';
import { FirefightingAPI } from '../../lib/firefighting-api';
import type { PPMRecord, PPMFinding, PPMLocation } from '../../types/firefighting';
import { PPMScheduleView } from './PPMScheduleView';
import { InspectionFormModal } from './InspectionFormModal';
import { FindingFormModal } from './FindingFormModal';
import { Card, Button } from '../ui';
import { theme, getThemeValue } from '../../lib/theme';



interface PPMManagementProps {}

export const PPMManagement: React.FC<PPMManagementProps> = () => {
  const [view, setView] = useState<'schedule' | 'records' | 'findings'>('schedule');
  const [ppmRecords, setPpmRecords] = useState<PPMRecord[]>([]);
  const [findings, setFindings] = useState<PPMFinding[]>([]);
  const [locations, setLocations] = useState<PPMLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showFindingModal, setShowFindingModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PPMRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [scheduleData, findingsData, locationsData] = await Promise.all([
        FirefightingAPI.getPPMSchedule(),
        FirefightingAPI.getFindings(),
        // Mock locations data
        Promise.resolve([
          { id: 1, location_name: 'Building 1', location_code: 'B1', description: 'Main office building', active: true },
          { id: 2, location_name: 'Building 2', location_code: 'B2', description: 'Secondary office building', active: true },
          { id: 3, location_name: 'Building 5', location_code: 'B5', description: 'Warehouse building', active: true },
          { id: 4, location_name: 'D44', location_code: 'D44', description: 'Residential block D44', active: true },
          { id: 5, location_name: 'D45', location_code: 'D45', description: 'Residential block D45', active: true },
          { id: 6, location_name: 'FM Building', location_code: 'FM', description: 'Facility management building', active: true },
          { id: 7, location_name: 'Sales Center', location_code: 'SC', description: 'Sales and marketing center', active: true },
          { id: 8, location_name: 'Pump Room', location_code: 'PR', description: 'Water pump station', active: true }
        ])
      ]);

      setPpmRecords(scheduleData as PPMRecord[]);
      setFindings(findingsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading PPM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewInspection = () => {
    setSelectedRecord(null);
    setShowInspectionModal(true);
  };

  const handleEditRecord = (record: PPMRecord) => {
    setSelectedRecord(record);
    setShowInspectionModal(true);
  };

  const handleNewFinding = (record?: PPMRecord) => {
    if (record) {
      setSelectedRecord(record);
    }
    setShowFindingModal(true);
  };

  const handleSaveInspection = async (inspectionData: Partial<PPMRecord>) => {
    try {
      if (selectedRecord) {
        // Update existing record - would need update API
        console.log('Update PPM record:', inspectionData);
      } else {
        const newRecord = await FirefightingAPI.submitInspection(inspectionData as Omit<PPMRecord, 'id' | 'created_at' | 'updated_at'>);
        setPpmRecords(prev => [newRecord, ...prev]);
      }
      setShowInspectionModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Failed to save inspection');
    }
  };

  const handleSaveFinding = async (findingData: Partial<PPMFinding>) => {
    try {
      const newFinding = await FirefightingAPI.createFinding(findingData as Omit<PPMFinding, 'id' | 'created_at' | 'updated_at'>);
      setFindings(prev => [newFinding, ...prev]);
      setShowFindingModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error saving finding:', error);
      alert('Failed to save finding');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return {
        backgroundColor: `${theme.colors.status.success}15`,
        color: theme.colors.status.success,
        borderColor: `${theme.colors.status.success}33`
      };
      case 'Pending': return {
        backgroundColor: `${theme.colors.status.warning}15`,
        color: theme.colors.status.warning,
        borderColor: `${theme.colors.status.warning}33`
      };
      case 'Failed': return {
        backgroundColor: `${theme.colors.status.error}15`,
        color: theme.colors.status.error,
        borderColor: `${theme.colors.status.error}33`
      };
      default: return {
        backgroundColor: `${theme.colors.gray[500]}15`,
        color: theme.colors.gray[500],
        borderColor: `${theme.colors.gray[500]}33`
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4" style={{ color: theme.colors.status.success }} />;
      case 'Pending': return <Clock className="h-4 w-4" style={{ color: theme.colors.status.warning }} />;
      case 'Failed': return <XCircle className="h-4 w-4" style={{ color: theme.colors.status.error }} />;
      default: return <Clock className="h-4 w-4" style={{ color: theme.colors.gray[500] }} />;
    }
  };

  const filteredRecords = ppmRecords.filter(record => {
    if (searchTerm && !record.location?.location_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterLocation && record.location_id.toString() !== filterLocation) {
      return false;
    }
    if (filterStatus && record.overall_status !== filterStatus) {
      return false;
    }
    if (dateRange.start && record.ppm_date < dateRange.start) {
      return false;
    }
    if (dateRange.end && record.ppm_date > dateRange.end) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
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
            Loading PPM data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Button onClick={handleNewInspection} variant="danger">
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
          <Button onClick={() => handleNewFinding()} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Finding
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setView('schedule')}
              variant={view === 'schedule' ? 'danger' : 'ghost'}
              size="md"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button
              onClick={() => setView('records')}
              variant={view === 'records' ? 'danger' : 'ghost'}
              size="md"
            >
              <FileText className="h-4 w-4 mr-2" />
              Records
            </Button>
            <Button
              onClick={() => setView('findings')}
              variant={view === 'findings' ? 'danger' : 'ghost'}
              size="md"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Findings
            </Button>
          </div>
        </div>

        {view === 'schedule' && (
          <PPMScheduleView
            locations={locations}
            onNewInspection={handleNewInspection}
            onEditRecord={handleEditRecord}
          />
        )}

        {view === 'records' && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id.toString()}>
                    {location.location_name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Inspector</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Findings</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {record.location?.location_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {new Date(record.ppm_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: `${theme.colors.status.info}15`,
                            color: theme.colors.status.info
                          }}
                        >
                          {record.ppm_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {record.inspector_name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.overall_status)}
                          <span 
                            className="px-2 py-1 text-xs rounded-full border"
                            style={getStatusColor(record.overall_status)}
                          >
                            {record.overall_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 dark:text-gray-300">
                            {record.findings?.length || 0} findings
                          </span>
                          {(record.findings?.length || 0) > 0 && (
                            <AlertTriangle className="h-4 w-4" style={{ color: theme.colors.status.warning }} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRecord(record)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNewFinding(record)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No PPM records found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {view === 'findings' && (
          <div className="p-6">
            <div className="space-y-4">
              {findings.map((finding) => (
                <Card
                  key={finding.id}
                  padding="md"
                  hover={true}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span 
                        className="px-2 py-1 text-xs rounded-full border"
                        style={{
                          backgroundColor: 
                            finding.severity === 'Critical' ? `${theme.colors.status.error}15` :
                            finding.severity === 'High' ? `${theme.colors.status.warning}15` :
                            finding.severity === 'Medium' ? `${theme.colors.extended.orange}15` :
                            `${theme.colors.status.info}15`,
                          color:
                            finding.severity === 'Critical' ? theme.colors.status.error :
                            finding.severity === 'High' ? theme.colors.status.warning :
                            finding.severity === 'Medium' ? theme.colors.extended.orange :
                            theme.colors.status.info,
                          borderColor:
                            finding.severity === 'Critical' ? `${theme.colors.status.error}33` :
                            finding.severity === 'High' ? `${theme.colors.status.warning}33` :
                            finding.severity === 'Medium' ? `${theme.colors.extended.orange}33` :
                            `${theme.colors.status.info}33`
                        }}
                      >
                        {finding.severity}
                      </span>
                      <span 
                        className="px-2 py-1 text-xs rounded-full border"
                        style={{
                          backgroundColor: 
                            finding.status === 'Open' ? `${theme.colors.status.error}15` :
                            finding.status === 'In Progress' ? `${theme.colors.status.warning}15` :
                            `${theme.colors.status.success}15`,
                          color:
                            finding.status === 'Open' ? theme.colors.status.error :
                            finding.status === 'In Progress' ? theme.colors.status.warning :
                            theme.colors.status.success,
                          borderColor:
                            finding.status === 'Open' ? `${theme.colors.status.error}33` :
                            finding.status === 'In Progress' ? `${theme.colors.status.warning}33` :
                            `${theme.colors.status.success}33`
                        }}
                      >
                        {finding.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {finding.created_at ? new Date(finding.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {finding.ppm_record?.location?.location_name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {finding.finding_description}
                    </p>
                  </div>
                  
                  {finding.recommended_action && (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">Recommended Action</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {finding.recommended_action}
                      </p>
                    </div>
                  )}
                  
                  {finding.estimated_cost && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Estimated Cost:</strong> OMR {finding.estimated_cost.toLocaleString()}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {findings.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: theme.colors.status.success }} />
                <p className="text-gray-600 dark:text-gray-300">No findings reported</p>
                <p className="text-sm text-gray-500">All systems are operating normally</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <InspectionFormModal
        isOpen={showInspectionModal}
        onClose={() => {
          setShowInspectionModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        locations={locations}
        onSave={handleSaveInspection}
      />

      <FindingFormModal
        isOpen={showFindingModal}
        onClose={() => {
          setShowFindingModal(false);
          setSelectedRecord(null);
        }}
        ppmRecord={selectedRecord}
        onSave={handleSaveFinding}
      />
    </div>
  );
};