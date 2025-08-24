export interface Database {
  public: {
    Tables: {
      equipment_types: {
        Row: {
          id: number;
          type_code: string;
          type_name: string;
          category: 'Fire Detection' | 'Fire Suppression';
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          type_code: string;
          type_name: string;
          category: 'Fire Detection' | 'Fire Suppression';
          description?: string;
        };
        Update: {
          type_code?: string;
          type_name?: string;
          category?: 'Fire Detection' | 'Fire Suppression';
          description?: string;
        };
      };
      equipment: {
        Row: {
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
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
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
        };
        Update: {
          equipment_code?: string;
          equipment_name?: string;
          equipment_type_id?: number;
          location_id?: number;
          manufacturer?: string;
          model?: string;
          serial_number?: string;
          installation_date?: string;
          warranty_expiry?: string;
          status?: 'Active' | 'Faulty' | 'Under Maintenance' | 'Inactive';
        };
      };
      ppm_locations: {
        Row: {
          id: number;
          location_name: string;
          location_code: string;
          description?: string;
          active: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          location_name: string;
          location_code: string;
          description?: string;
          active?: boolean;
        };
        Update: {
          location_name?: string;
          location_code?: string;
          description?: string;
          active?: boolean;
        };
      };
      ppm_records: {
        Row: {
          id: number;
          location_id: number;
          ppm_date: string;
          ppm_type: 'Quarterly' | 'Bi-Annual' | 'Annual';
          inspector_name: string;
          overall_status: 'Completed' | 'Pending' | 'Failed';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          location_id: number;
          ppm_date: string;
          ppm_type: 'Quarterly' | 'Bi-Annual' | 'Annual';
          inspector_name: string;
          overall_status: 'Completed' | 'Pending' | 'Failed';
          notes?: string;
        };
        Update: {
          location_id?: number;
          ppm_date?: string;
          ppm_type?: 'Quarterly' | 'Bi-Annual' | 'Annual';
          inspector_name?: string;
          overall_status?: 'Completed' | 'Pending' | 'Failed';
          notes?: string;
        };
      };
      ppm_findings: {
        Row: {
          id: number;
          ppm_record_id: number;
          finding_description: string;
          severity: 'Critical' | 'High' | 'Medium' | 'Low';
          status: 'Open' | 'Closed' | 'In Progress';
          recommended_action?: string;
          spare_parts_required?: string;
          estimated_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          ppm_record_id: number;
          finding_description: string;
          severity: 'Critical' | 'High' | 'Medium' | 'Low';
          status: 'Open' | 'Closed' | 'In Progress';
          recommended_action?: string;
          spare_parts_required?: string;
          estimated_cost?: number;
        };
        Update: {
          ppm_record_id?: number;
          finding_description?: string;
          severity?: 'Critical' | 'High' | 'Medium' | 'Low';
          status?: 'Open' | 'Closed' | 'In Progress';
          recommended_action?: string;
          spare_parts_required?: string;
          estimated_cost?: number;
        };
      };
      spare_parts: {
        Row: {
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
        };
        Insert: {
          part_name: string;
          part_number: string;
          supplier?: string;
          unit_cost?: number;
          stock_quantity: number;
          minimum_stock: number;
          description?: string;
        };
        Update: {
          part_name?: string;
          part_number?: string;
          supplier?: string;
          unit_cost?: number;
          stock_quantity?: number;
          minimum_stock?: number;
          description?: string;
        };
      };
      findings_status: {
        Row: {
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
        };
        Insert: {
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
        };
        Update: {
          finding_id?: number;
          status?: 'Open' | 'Closed' | 'In Progress';
          status_date?: string;
          quote_number?: string;
          quote_amount?: number;
          approval_status?: 'Pending' | 'Approved' | 'Rejected';
          approval_date?: string;
          approved_by?: string;
          resolution_date?: string;
          resolution_notes?: string;
        };
      };
      contractor_tracker: {
        Row: {
          id: number;
          contractor_name: string;
          service_provided: string;
          status: 'Active' | 'Expired' | 'Pending';
          contract_type: 'Contract' | 'PO';
          start_date: string;
          end_date: string;
          contract_monthly_amount: number | null;
          contract_yearly_amount: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          contractor_name: string;
          service_provided: string;
          status: 'Active' | 'Expired' | 'Pending';
          contract_type: 'Contract' | 'PO';
          start_date: string;
          end_date: string;
          contract_monthly_amount?: number | null;
          contract_yearly_amount?: number | null;
          notes?: string | null;
        };
        Update: {
          contractor_name?: string;
          service_provided?: string;
          status?: 'Active' | 'Expired' | 'Pending';
          contract_type?: 'Contract' | 'PO';
          start_date?: string;
          end_date?: string;
          contract_monthly_amount?: number | null;
          contract_yearly_amount?: number | null;
          notes?: string | null;
        };
      };
      contractor_tracker_summary: {
        Row: {
          total_contracts: number;
          active_contracts: number;
          expired_contracts: number;
          pending_contracts: number;
          total_yearly_value: number;
          average_contract_duration: number;
        };
      };
      contracts_expiring_soon: {
        Row: {
          id: number;
          contractor_name: string;
          service_provided: string;
          end_date: string;
          days_until_expiry: number;
          contract_yearly_amount: number | null;
          urgency_level: 'Critical' | 'High' | 'Medium' | 'Low';
        };
      };
      contracts_by_service: {
        Row: {
          service_category: string;
          contract_count: number;
          total_value: number;
          average_value: number;
          active_count: number;
          expired_count: number;
        };
      };
    };
  };
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer'
}

export interface SystemIntegration {
  hvac: {
    linkFireDampers: boolean;
    smokeExhaustFans: any[];
  };
  energy: {
    emergencyPowerSystems: boolean;
    batteryBackupStatus: string;
  };
  water: {
    sprinklerWaterPressure: number;
    fireHydrantFlow: number;
  };
}

export interface ReportConfig {
  schedule: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'dashboard';
  sections: {
    executiveSummary: boolean;
    complianceStatus: boolean;
    findingsAnalysis: boolean;
    financialSummary: boolean;
    recommendations: boolean;
  };
}