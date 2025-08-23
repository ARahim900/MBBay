import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import type { PPMRecord, PPMLocation } from '../../types/firefighting';

interface InspectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PPMRecord | null;
  locations: PPMLocation[];
  onSave: (data: Partial<PPMRecord>) => void;
}

export const InspectionFormModal: React.FC<InspectionFormModalProps> = ({
  isOpen,
  onClose,
  record,
  locations,
  onSave
}) => {
  const [formData, setFormData] = useState({
    location_id: '',
    ppm_date: '',
    ppm_type: 'Quarterly' as const,
    inspector_name: '',
    overall_status: 'Pending' as const,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (record) {
      setFormData({
        location_id: record.location_id.toString(),
        ppm_date: record.ppm_date,
        ppm_type: record.ppm_type,
        inspector_name: record.inspector_name,
        overall_status: record.overall_status,
        notes: record.notes || ''
      });
    } else {
      setFormData({
        location_id: '',
        ppm_date: new Date().toISOString().split('T')[0],
        ppm_type: 'Quarterly',
        inspector_name: '',
        overall_status: 'Pending',
        notes: ''
      });
    }
    setErrors({});
  }, [record, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.location_id) {
      newErrors.location_id = 'Location is required';
    }
    if (!formData.ppm_date) {
      newErrors.ppm_date = 'Date is required';
    }
    if (!formData.inspector_name.trim()) {
      newErrors.inspector_name = 'Inspector name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const inspectionData: Partial<PPMRecord> = {
      ...formData,
      location_id: parseInt(formData.location_id),
      ppm_type: formData.ppm_type as PPMRecord['ppm_type'],
      overall_status: formData.overall_status as PPMRecord['overall_status']
    };

    onSave(inspectionData);
  };

  const checklistItems = [
    { id: 'fire_alarm_panel', label: 'Fire Alarm Panel - Visual & Audio Test', checked: false },
    { id: 'smoke_detectors', label: 'Smoke Detectors - Function Test', checked: false },
    { id: 'heat_detectors', label: 'Heat Detectors - Function Test', checked: false },
    { id: 'fire_extinguishers', label: 'Fire Extinguishers - Physical Inspection', checked: false },
    { id: 'emergency_lighting', label: 'Emergency Lighting - Operation Test', checked: false },
    { id: 'fire_doors', label: 'Fire Doors - Closure Test', checked: false },
    { id: 'sprinkler_system', label: 'Sprinkler System - Pressure Check', checked: false },
    { id: 'fire_pumps', label: 'Fire Pumps - Performance Test', checked: false }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-[#4E4456] dark:text-white">
            {record ? 'Edit Inspection Record' : 'New PPM Inspection'}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location *
              </label>
              <select
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.location_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.location_name} ({location.location_code})
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="text-red-500 text-xs mt-1">{errors.location_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Inspection Date *
              </label>
              <input
                type="date"
                name="ppm_date"
                value={formData.ppm_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.ppm_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.ppm_date && (
                <p className="text-red-500 text-xs mt-1">{errors.ppm_date}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PPM Type
              </label>
              <select
                name="ppm_type"
                value={formData.ppm_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Quarterly">Quarterly</option>
                <option value="Bi-Annual">Bi-Annual</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Inspector Name *
              </label>
              <input
                type="text"
                name="inspector_name"
                value={formData.inspector_name}
                onChange={handleChange}
                placeholder="Inspector name"
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.inspector_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.inspector_name && (
                <p className="text-red-500 text-xs mt-1">{errors.inspector_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Overall Status
            </label>
            <select
              name="overall_status"
              value={formData.overall_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Inspection Checklist
            </label>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={item.id}
                      className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Additional notes and observations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-500 hover:bg-red-600">
              <Save className="h-4 w-4 mr-2" />
              Save Inspection
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};