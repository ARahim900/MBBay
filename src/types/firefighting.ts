export interface EquipmentType {
  id: number;
  type_code: string;
  type_name: string;
  category: 'Fire Detection' | 'Fire Suppression';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Equipment {
  id: number;
  equipment_code: string;
  equipment_name: string;
  equipment_type_id: number;
  location_id: number;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  installation_date?: string;
  warranty_expiry?: string;
  status: 'Active' | 'Faulty' | 'Under Maintenance' | 'Inactive';
  qr_code?: string;
  created_at?: string;
  updated_at?: string;
  
  equipment_type?: EquipmentType;
  location?: PPMLocation;
}

export interface PPMLocation {
  id: number;
  location_name: string;
  location_code: string;
  description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PPMRecord {
  id: number;
  location_id: number;
  ppm_date: string;
  ppm_type: 'Quarterly' | 'Bi-Annual' | 'Annual';
  inspector_name: string;
  overall_status: 'Completed' | 'Pending' | 'Failed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  
  location?: PPMLocation;
  findings?: PPMFinding[];
}

export interface PPMFinding {
  id: number;
  ppm_record_id: number;
  finding_description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Closed' | 'In Progress';
  recommended_action?: string;
  spare_parts_required?: string;
  estimated_cost?: number;
  photos?: string[];
  created_at?: string;
  updated_at?: string;
  
  ppm_record?: PPMRecord;
  spare_parts?: SparePart[];
  findings_status?: FindingsStatus[];
}

export interface SparePart {
  id: number;
  part_name: string;
  part_number: string;
  supplier?: string;
  unit_cost?: number;
  stock_quantity: number;
  minimum_stock: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FindingsStatus {
  id: number;
  finding_id: number;
  status: 'Open' | 'Closed' | 'In Progress';
  status_date: string;
  quote_number?: string;
  quote_amount?: number;
  approval_status?: 'Pending' | 'Approved' | 'Rejected';
  approval_date?: string;
  approved_by?: string;
  resolution_date?: string;
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
  
  finding?: PPMFinding;
}

export interface FirefightingDashboardStats {
  totalEquipment: number;
  activeEquipment: number;
  faultyEquipment: number;
  criticalFindings: number;
  pendingPPMs: number;
  complianceRate: number;
  monthlyPPMCost: number;
  upcomingInspections: number;
}

export interface FirefightingEquipment extends Equipment {
  type: 'Fire Alarm Panel' | 'Smoke Detector' | 'Heat Detector' | 'Fire Pump' | 'Sprinkler' | 'Fire Extinguisher';
  location: string;
  last_inspection?: Date;
  next_inspection?: Date;
  warranty_expiry?: Date;
}

export interface Finding extends PPMFinding {
  location: string;
  equipment_id: number;
  identified_date: Date;
  resolution_deadline: Date;
  actual_cost?: number;
  assigned_to?: string;
}

export interface PPMSchedule {
  id: number;
  location_id: number;
  scheduled_date: string;
  ppm_type: 'Quarterly' | 'Bi-Annual' | 'Annual';
  inspector_assigned?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  checklist_template?: string;
  location?: PPMLocation;
}

export interface EquipmentMaintenance {
  id: number;
  equipment_id: number;
  maintenance_type: 'Preventive' | 'Corrective' | 'Emergency';
  maintenance_date: string;
  technician_name?: string;
  description: string;
  cost: number;
  parts_replaced?: string;
  next_service_date?: string;
  status: 'Completed' | 'Pending' | 'In Progress';
  
  equipment?: Equipment;
}

export interface FireSafetyReport {
  id: number;
  report_type: 'Monthly' | 'Quarterly' | 'Annual';
  period_start: string;
  period_end: string;
  generated_by: string;
  generated_date: string;
  compliance_score: number;
  total_equipment: number;
  functional_equipment: number;
  critical_issues: number;
  resolved_issues: number;
  total_cost: number;
  recommendations?: string;
}

export interface FirefightingAlert {
  id: number;
  alert_type: 'Equipment Fault' | 'PPM Overdue' | 'Critical Finding' | 'Warranty Expiring' | 'Compliance Issue';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
  equipment_id?: number;
  location_id?: number;
  created_at: string;
  acknowledged?: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved?: boolean;
  resolved_at?: string;
}