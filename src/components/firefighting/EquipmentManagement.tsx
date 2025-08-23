import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Calendar, AlertTriangle, CheckCircle, Clock, QrCode } from 'lucide-react';
import { FirefightingAPI } from '../../lib/firefighting-api';
import type { Equipment, EquipmentType, PPMLocation } from '../../types/firefighting';
import { EquipmentModal } from './EquipmentModal';
import { QRCodeModal } from './QRCodeModal';
import { Card, Button } from '../ui';
import { theme, getThemeValue } from '../../lib/theme';

export const EquipmentManagement: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [locations, setLocations] = useState<PPMLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [equipment, searchTerm, filterStatus, filterLocation, filterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [equipmentData, typesData, locationsData] = await Promise.all([
        FirefightingAPI.getEquipment(),
        // Mock data for types and locations - replace with actual API calls
        Promise.resolve([
          { id: 1, type_code: 'FAP', type_name: 'Fire Alarm Panel', category: 'Fire Detection' as const, description: 'Central fire alarm control panel' },
          { id: 2, type_code: 'SMD', type_name: 'Smoke Detector', category: 'Fire Detection' as const, description: 'Photoelectric smoke detector' },
          { id: 3, type_code: 'HTD', type_name: 'Heat Detector', category: 'Fire Detection' as const, description: 'Fixed temperature heat detector' },
          { id: 4, type_code: 'FPU', type_name: 'Fire Pump', category: 'Fire Suppression' as const, description: 'Electric fire water pump' },
          { id: 5, type_code: 'FEX', type_name: 'Fire Extinguisher', category: 'Fire Suppression' as const, description: 'Portable fire extinguisher' },
          { id: 6, type_code: 'SPK', type_name: 'Sprinkler', category: 'Fire Suppression' as const, description: 'Automatic fire sprinkler' }
        ]),
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

      setEquipment(equipmentData);
      setEquipmentTypes(typesData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = equipment;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipment_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterLocation) {
      filtered = filtered.filter(item => item.location_id.toString() === filterLocation);
    }

    if (filterType) {
      filtered = filtered.filter(item => item.equipment_type_id.toString() === filterType);
    }

    setFilteredEquipment(filtered);
  };

  const handleAdd = () => {
    setSelectedEquipment(null);
    setShowModal(true);
  };

  const handleEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await FirefightingAPI.deleteEquipment(id);
        setEquipment(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting equipment:', error);
        alert('Failed to delete equipment');
      }
    }
  };

  const handleSave = async (equipmentData: Partial<Equipment>) => {
    try {
      if (selectedEquipment) {
        const updated = await FirefightingAPI.updateEquipment(selectedEquipment.id, equipmentData);
        setEquipment(prev => prev.map(item => item.id === selectedEquipment.id ? updated : item));
      } else {
        const created = await FirefightingAPI.createEquipment(equipmentData as Omit<Equipment, 'id' | 'created_at' | 'updated_at'>);
        setEquipment(prev => [...prev, created]);
      }
      setShowModal(false);
      setSelectedEquipment(null);
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Failed to save equipment');
    }
  };

  const handleShowQR = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowQRModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" style={{ color: theme.colors.status.success }} />;
      case 'Faulty': return <AlertTriangle className="h-4 w-4" style={{ color: theme.colors.status.error }} />;
      case 'Under Maintenance': return <Clock className="h-4 w-4" style={{ color: theme.colors.status.warning }} />;
      case 'Inactive': return <AlertTriangle className="h-4 w-4" style={{ color: theme.colors.gray[500] }} />;
      default: return <AlertTriangle className="h-4 w-4" style={{ color: theme.colors.gray[500] }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return {
        backgroundColor: `${theme.colors.status.success}15`,
        color: theme.colors.status.success,
        borderColor: `${theme.colors.status.success}33`
      };
      case 'Faulty': return {
        backgroundColor: `${theme.colors.status.error}15`,
        color: theme.colors.status.error,
        borderColor: `${theme.colors.status.error}33`
      };
      case 'Under Maintenance': return {
        backgroundColor: `${theme.colors.status.warning}15`,
        color: theme.colors.status.warning,
        borderColor: `${theme.colors.status.warning}33`
      };
      case 'Inactive': return {
        backgroundColor: `${theme.colors.gray[500]}15`,
        color: theme.colors.gray[500],
        borderColor: `${theme.colors.gray[500]}33`
      };
      default: return {
        backgroundColor: `${theme.colors.gray[500]}15`,
        color: theme.colors.gray[500],
        borderColor: `${theme.colors.gray[500]}33`
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: theme.colors.status.error }}></div>
          <p className="mt-4" style={{ color: theme.colors.textSecondary, fontSize: theme.typography.labelSize, fontFamily: theme.typography.fontFamily }}>Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleAdd} variant="danger" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                style={{
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.labelSize,
                  fontFamily: theme.typography.fontFamily,
                  padding: theme.spacing.sm
                }}
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
                <option value="Active">Active</option>
                <option value="Faulty">Faulty</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
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

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Types</option>
              {equipmentTypes.map(type => (
                <option key={type.id} value={type.id.toString()}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <Card key={item.id} padding="md" hover={true}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-1 text-xs rounded-full border"
                      style={{
                        ...getStatusColor(item.status),
                        fontSize: theme.typography.tooltipSize,
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: theme.typography.fontWeight.medium,
                        borderRadius: theme.borderRadius.full
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowQR(item)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                  <div>
                    <h3 
                      style={{ 
                        fontSize: theme.typography.titleSize,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontFamily
                      }}
                      className="dark:text-white"
                    >
                      {item.equipment_name}
                    </h3>
                    <p 
                      style={{ 
                        fontSize: theme.typography.labelSize,
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamily
                      }}
                      className="dark:text-gray-300"
                    >
                      Code: {item.equipment_code}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location?.location_name || 'Unknown Location'}</span>
                  </div>

                  {item.manufacturer && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Manufacturer:</strong> {item.manufacturer}
                    </div>
                  )}

                  {item.model && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Model:</strong> {item.model}
                    </div>
                  )}

                  {item.installation_date && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>Installed: {new Date(item.installation_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {item.warranty_expiry && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Warranty:</strong> {new Date(item.warranty_expiry).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: theme.colors.gray[400] }} />
              <p style={{ color: theme.colors.textSecondary, fontSize: theme.typography.labelSize, fontFamily: theme.typography.fontFamily }} className="dark:text-gray-300">No equipment found</p>
              <p style={{ color: theme.colors.gray[500], fontSize: theme.typography.tooltipSize, fontFamily: theme.typography.fontFamily }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </Card>

      <EquipmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEquipment(null);
        }}
        equipment={selectedEquipment}
        equipmentTypes={equipmentTypes}
        locations={locations}
        onSave={handleSave}
      />

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedEquipment(null);
        }}
        equipment={selectedEquipment}
      />
    </div>
  );
};