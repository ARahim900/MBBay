import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Camera, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import type { PPMRecord, PPMFinding } from '../../types/firefighting';

interface FindingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ppmRecord: PPMRecord | null;
  onSave: (data: Partial<PPMFinding>) => void;
}

export const FindingFormModal: React.FC<FindingFormModalProps> = ({
  isOpen,
  onClose,
  ppmRecord,
  onSave
}) => {
  const [formData, setFormData] = useState({
    ppm_record_id: '',
    finding_description: '',
    severity: 'Medium' as const,
    status: 'Open' as const,
    recommended_action: '',
    spare_parts_required: '',
    estimated_cost: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    if (ppmRecord) {
      setFormData(prev => ({
        ...prev,
        ppm_record_id: ppmRecord.id.toString()
      }));
    } else {
      setFormData({
        ppm_record_id: '',
        finding_description: '',
        severity: 'Medium',
        status: 'Open',
        recommended_action: '',
        spare_parts_required: '',
        estimated_cost: ''
      });
    }
    setErrors({});
    setPhotos([]);
  }, [ppmRecord, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 5)); // Limit to 5 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.finding_description.trim()) {
      newErrors.finding_description = 'Finding description is required';
    }

    if (formData.estimated_cost && isNaN(parseFloat(formData.estimated_cost))) {
      newErrors.estimated_cost = 'Please enter a valid cost';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const findingData: Partial<PPMFinding> = {
      ppm_record_id: parseInt(formData.ppm_record_id),
      finding_description: formData.finding_description.trim(),
      severity: formData.severity as PPMFinding['severity'],
      status: formData.status as PPMFinding['status'],
      recommended_action: formData.recommended_action.trim() || undefined,
      spare_parts_required: formData.spare_parts_required.trim() || undefined,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined
    };

    onSave(findingData);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-[#4E4456] dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Report Finding
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {ppmRecord && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Related to PPM Record</span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Location:</strong> {ppmRecord.location?.location_name}</p>
                <p><strong>Date:</strong> {new Date(ppmRecord.ppm_date).toLocaleDateString()}</p>
                <p><strong>Inspector:</strong> {ppmRecord.inspector_name}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity Level *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${getSeverityColor(formData.severity)}`}
              >
                <option value="Low">Low - Minor issue, routine maintenance</option>
                <option value="Medium">Medium - Needs attention, plan repair</option>
                <option value="High">High - Important, schedule repair soon</option>
                <option value="Critical">Critical - Immediate action required</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Open">Open - Needs attention</option>
                <option value="In Progress">In Progress - Being worked on</option>
                <option value="Closed">Closed - Resolved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Finding Description *
            </label>
            <textarea
              name="finding_description"
              value={formData.finding_description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue, defect, or observation in detail..."
              className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.finding_description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.finding_description && (
              <p className="text-red-500 text-xs mt-1">{errors.finding_description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recommended Action
            </label>
            <textarea
              name="recommended_action"
              value={formData.recommended_action}
              onChange={handleChange}
              rows={3}
              placeholder="What action should be taken to resolve this finding?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spare Parts Required
              </label>
              <textarea
                name="spare_parts_required"
                value={formData.spare_parts_required}
                onChange={handleChange}
                rows={2}
                placeholder="List any spare parts needed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Estimated Cost (OMR)
              </label>
              <input
                type="number"
                name="estimated_cost"
                value={formData.estimated_cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.estimated_cost ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.estimated_cost && (
                <p className="text-red-500 text-xs mt-1">{errors.estimated_cost}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Camera className="h-4 w-4 inline mr-1" />
              Photo Evidence (Max 5 photos)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Finding photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.severity === 'Critical' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Critical Finding Alert</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                This critical finding will trigger immediate notifications to management and require urgent attention.
                Please ensure all details are accurate and complete.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-500 hover:bg-red-600">
              <Save className="h-4 w-4 mr-2" />
              Report Finding
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};