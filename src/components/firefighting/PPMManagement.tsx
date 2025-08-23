import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Filter, Search, FileText, Camera, AlertTriangle } from 'lucide-react';
import { Card, Button } from '../ui';
import { FirefightingAPI } from '../../lib/firefighting-api';
import type { PPMRecord, PPMFinding, PPMLocation } from '../../types/firefighting';
import { PPMScheduleView } from './PPMScheduleView';
import { InspectionFormModal } from './InspectionFormModal';
import { FindingFormModal } from './FindingFormModal';

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
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading PPM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#4E4456] dark:text-white">PPM Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Planned Preventive Maintenance scheduling and tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleNewInspection} className="bg-red-500 hover:bg-red-600">
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
          <Button onClick={() => handleNewFinding()} variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Finding
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('schedule')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'schedule'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </button>
          <button
            onClick={() => setView('records')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'records'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Records
          </button>
          <button
            onClick={() => setView('findings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'findings'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Findings
          </button>
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
        <Card>
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
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {record.ppm_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {record.inspector_name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.overall_status)}
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(record.overall_status)}`}>
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
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
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
        </Card>
      )}

      {view === 'findings' && (
        <Card>
          <div className="p-6">
            <div className="space-y-4">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        finding.severity === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' :
                        finding.severity === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        finding.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {finding.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        finding.status === 'Open' ? 'bg-red-100 text-red-800 border-red-200' :
                        finding.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }`}>
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
                </div>
              ))}
            </div>

            {findings.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">No findings reported</p>
                <p className="text-sm text-gray-500">All systems are operating normally</p>
              </div>
            )}
          </div>
        </Card>
      )}

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