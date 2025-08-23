import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Equipment } from '../../types/firefighting';
import { theme, getThemeValue } from '../../lib/theme';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  equipment
}) => {
  const generateQRCode = (data: string) => {
    const size = 200;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
    return url;
  };

  const handleDownload = async () => {
    if (!equipment) return;
    
    const qrData = JSON.stringify({
      id: equipment.id,
      code: equipment.equipment_code,
      name: equipment.equipment_name,
      type: equipment.equipment_type?.type_name,
      location: equipment.location?.location_name
    });
    
    const qrUrl = generateQRCode(qrData);
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${equipment.equipment_code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !equipment) return null;

  const qrData = JSON.stringify({
    id: equipment.id,
    code: equipment.equipment_code,
    name: equipment.equipment_name,
    type: equipment.equipment_type?.type_name,
    location: equipment.location?.location_name
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 
            className="dark:text-white"
            style={{ 
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontFamily
            }}
          >
            QR Code - {equipment.equipment_code}
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 text-center">
          <div 
            className="bg-white inline-block shadow-sm mb-4"
            style={{ 
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm
            }}
          >
            <img
              src={generateQRCode(qrData)}
              alt={`QR Code for ${equipment.equipment_code}`}
              className="mx-auto mb-2"
            />
            <div style={{ fontSize: theme.typography.labelSize, color: theme.colors.textSecondary }}>
              <p 
                style={{ 
                  fontWeight: theme.typography.fontWeight.semibold,
                  fontFamily: theme.typography.fontFamily
                }}
              >
                {equipment.equipment_name}
              </p>
              <p style={{ fontFamily: theme.typography.fontFamily }}>{equipment.equipment_code}</p>
              <p 
                style={{ 
                  fontSize: theme.typography.tooltipSize,
                  color: theme.colors.gray[500],
                  marginTop: theme.spacing.xs,
                  fontFamily: theme.typography.fontFamily
                }}
              >
                {equipment.location?.location_name}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Scan this QR code to access equipment details and maintenance history.
            </div>
            
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Equipment ID:</strong> {equipment.id}</p>
            <p><strong>Type:</strong> {equipment.equipment_type?.type_name}</p>
            <p><strong>Status:</strong> {equipment.status}</p>
            {equipment.manufacturer && (
              <p><strong>Manufacturer:</strong> {equipment.manufacturer}</p>
            )}
            {equipment.model && (
              <p><strong>Model:</strong> {equipment.model}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};