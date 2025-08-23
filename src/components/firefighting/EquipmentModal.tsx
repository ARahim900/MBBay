import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Equipment, EquipmentType, PPMLocation } from '../../types/firefighting';

// Button Component matching the existing design
const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, ...props }: any) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
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
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  equipmentTypes: EquipmentType[];
  locations: PPMLocation[];
  onSave: (equipment: Partial<Equipment>) => void;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  equipment,
  equipmentTypes,
  locations,
  onSave
}) => {
  const [formData, setFormData] = useState({
    equipment_code: '',
    equipment_name: '',
    equipment_type_id: '',
    location_id: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    installation_date: '',
    warranty_expiry: '',
    status: 'Active' as const
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (equipment) {
      setFormData({
        equipment_code: equipment.equipment_code || '',
        equipment_name: equipment.equipment_name || '',
        equipment_type_id: equipment.equipment_type_id.toString(),
        location_id: equipment.location_id.toString(),
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        installation_date: equipment.installation_date || '',
        warranty_expiry: equipment.warranty_expiry || '',
        status: equipment.status
      });
    } else {
      setFormData({
        equipment_code: '',
        equipment_name: '',
        equipment_type_id: '',
        location_id: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        installation_date: '',
        warranty_expiry: '',
        status: 'Active'
      });
    }
    setErrors({});
  }, [equipment, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipment_code.trim()) {
      newErrors.equipment_code = 'Equipment code is required';
    }
    if (!formData.equipment_name.trim()) {
      newErrors.equipment_name = 'Equipment name is required';
    }
    if (!formData.equipment_type_id) {
      newErrors.equipment_type_id = 'Equipment type is required';
    }
    if (!formData.location_id) {
      newErrors.location_id = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const equipmentData: Partial<Equipment> = {
      ...formData,
      equipment_type_id: parseInt(formData.equipment_type_id),
      location_id: parseInt(formData.location_id),
      status: formData.status as Equipment['status']
    };

    onSave(equipmentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-[#4E4456] dark:text-white">
            {equipment ? 'Edit Equipment' : 'Add Equipment'}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Equipment Code *
              </label>
              <input
                type="text"
                name="equipment_code"
                value={formData.equipment_code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.equipment_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., FAP-001"
              />
              {errors.equipment_code && (
                <p className="text-red-500 text-xs mt-1">{errors.equipment_code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Equipment Name *
              </label>
              <input
                type="text"
                name="equipment_name"
                value={formData.equipment_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.equipment_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Equipment name"
              />
              {errors.equipment_name && (
                <p className="text-red-500 text-xs mt-1">{errors.equipment_name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Equipment Type *
              </label>
              <select
                name="equipment_type_id"
                value={formData.equipment_type_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.equipment_type_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select type</option>
                {equipmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
              {errors.equipment_type_id && (
                <p className="text-red-500 text-xs mt-1">{errors.equipment_type_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    {location.location_name}
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="text-red-500 text-xs mt-1">{errors.location_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Manufacturer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Model number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Serial number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Installation Date
              </label>
              <input
                type="date"
                name="installation_date"
                value={formData.installation_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Warranty Expiry
              </label>
              <input
                type="date"
                name="warranty_expiry"
                value={formData.warranty_expiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Active">Active</option>
              <option value="Faulty">Faulty</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-500 hover:bg-red-600">
              <Save className="h-4 w-4 mr-2" />
              Save Equipment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};