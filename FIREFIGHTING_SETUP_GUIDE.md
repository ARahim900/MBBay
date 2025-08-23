# Firefighting & Alarm System Setup Guide

## 🚀 System Overview

The Firefighting & Alarm System is a comprehensive module for managing fire safety equipment, planned preventive maintenance (PPM), and safety compliance tracking. The system is currently running with **mock data** for demonstration purposes.

## 📊 Current Status

✅ **WORKING NOW** - The system is fully functional with mock data
⏳ **DATABASE SETUP REQUIRED** - For production use with real data

## 🎯 Features Available

### 1. Dashboard Overview
- **System Health Score**: Visual compliance indicator (87.5% compliance shown)
- **KPI Cards**: Equipment health, critical findings, monthly costs
- **Building Heat Map**: Interactive SVG visualization of safety risks
- **Active Alerts**: Real-time critical notifications
- **Upcoming Inspections**: Schedule overview with priority indicators

### 2. Equipment Management
- **Equipment Catalog**: 48 pieces of firefighting equipment (mock data)
- **Status Tracking**: Active, Faulty, Under Maintenance, Inactive
- **QR Code Generation**: Digital equipment identification
- **Maintenance History**: Installation dates, warranty tracking
- **Advanced Filtering**: By location, status, equipment type

### 3. PPM (Planned Preventive Maintenance)
- **Calendar View**: Interactive monthly/weekly schedule
- **Inspection Forms**: Digital checklists with completion tracking
- **Inspector Assignment**: Track who performed inspections
- **Types**: Quarterly, Bi-Annual, Annual maintenance schedules

### 4. Findings & Issues Tracker
- **Severity Classification**: Critical, High, Medium, Low
- **Photo Evidence**: Upload up to 5 photos per finding
- **Cost Tracking**: Budget estimation for repairs
- **Action Workflow**: Open → In Progress → Closed

## 🔧 How to Access

1. **Start the Application**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:5181`

2. **Navigate to Firefighting Module**:
   - Click "Firefighting & Alarm" in the sidebar (flame icon)
   - The system will load with demonstration data

3. **Explore Features**:
   - **Dashboard Tab**: Overview with KPIs and alerts
   - **Equipment Tab**: Manage firefighting equipment
   - **PPM Tab**: Schedule and track maintenance
   - **Findings Tab**: Report and track safety issues

## 📋 Mock Data Currently Showing

### Equipment (3 sample items):
- Fire Alarm Panel - Building 1 (Active)
- Smoke Detector - Level 1 (Active)  
- Fire Extinguisher - CO2 5kg (Faulty)

### Critical Findings (2 active):
- Fire alarm panel battery backup failure
- Fire extinguisher pressure gauge critical

### Active Alerts (3 notifications):
- Battery backup failure in Building 1
- PPM overdue for fire extinguishers
- Critical low pressure alert

## 🗄️ Database Setup (For Production Use)

To connect to your Supabase database with real data, you'll need to create these tables:

### Required Tables:

1. **equipment_types**
   ```sql
   CREATE TABLE equipment_types (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     type_code VARCHAR(10) NOT NULL,
     type_name VARCHAR(100) NOT NULL,
     category VARCHAR(20) CHECK (category IN ('Fire Detection', 'Fire Suppression')),
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **ppm_locations**
   ```sql
   CREATE TABLE ppm_locations (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     location_name VARCHAR(100) NOT NULL,
     location_code VARCHAR(10) NOT NULL UNIQUE,
     description TEXT,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **equipment**
   ```sql
   CREATE TABLE equipment (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     equipment_code VARCHAR(20) NOT NULL UNIQUE,
     equipment_name VARCHAR(200) NOT NULL,
     equipment_type_id BIGINT REFERENCES equipment_types(id),
     location_id BIGINT REFERENCES ppm_locations(id),
     manufacturer VARCHAR(100),
     model VARCHAR(100),
     serial_number VARCHAR(100),
     installation_date DATE,
     warranty_expiry DATE,
     status VARCHAR(20) CHECK (status IN ('Active', 'Faulty', 'Under Maintenance', 'Inactive')) DEFAULT 'Active',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **ppm_records**
   ```sql
   CREATE TABLE ppm_records (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     location_id BIGINT REFERENCES ppm_locations(id),
     ppm_date DATE NOT NULL,
     ppm_type VARCHAR(20) CHECK (ppm_type IN ('Quarterly', 'Bi-Annual', 'Annual')),
     inspector_name VARCHAR(100) NOT NULL,
     overall_status VARCHAR(20) CHECK (overall_status IN ('Completed', 'Pending', 'Failed')) DEFAULT 'Pending',
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **ppm_findings**
   ```sql
   CREATE TABLE ppm_findings (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     ppm_record_id BIGINT REFERENCES ppm_records(id),
     finding_description TEXT NOT NULL,
     severity VARCHAR(20) CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
     status VARCHAR(20) CHECK (status IN ('Open', 'Closed', 'In Progress')) DEFAULT 'Open',
     recommended_action TEXT,
     spare_parts_required TEXT,
     estimated_cost DECIMAL(10,2),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

6. **spare_parts**
   ```sql
   CREATE TABLE spare_parts (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     part_name VARCHAR(200) NOT NULL,
     part_number VARCHAR(100) NOT NULL,
     supplier VARCHAR(100),
     unit_cost DECIMAL(10,2),
     stock_quantity INTEGER DEFAULT 0,
     minimum_stock INTEGER DEFAULT 0,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

7. **findings_status**
   ```sql
   CREATE TABLE findings_status (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     finding_id BIGINT REFERENCES ppm_findings(id),
     status VARCHAR(20) CHECK (status IN ('Open', 'Closed', 'In Progress')),
     status_date DATE NOT NULL,
     quote_number VARCHAR(50),
     quote_amount DECIMAL(10,2),
     approval_status VARCHAR(20) CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
     approval_date DATE,
     approved_by VARCHAR(100),
     resolution_date DATE,
     resolution_notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

8. **firefighting_alerts** (Optional - for real-time notifications)
   ```sql
   CREATE TABLE firefighting_alerts (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     alert_type VARCHAR(50) NOT NULL,
     severity VARCHAR(20) CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
     message TEXT NOT NULL,
     equipment_id BIGINT REFERENCES equipment(id),
     location_id BIGINT REFERENCES pmp_locations(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     acknowledged BOOLEAN DEFAULT false,
     acknowledged_by VARCHAR(100),
     acknowledged_at TIMESTAMP WITH TIME ZONE,
     resolved BOOLEAN DEFAULT false,
     resolved_at TIMESTAMP WITH TIME ZONE
   );
   ```

### Sample Data Insert Scripts:

```sql
-- Equipment Types
INSERT INTO equipment_types (type_code, type_name, category, description) VALUES
('FAP', 'Fire Alarm Panel', 'Fire Detection', 'Central fire alarm control panel'),
('SMD', 'Smoke Detector', 'Fire Detection', 'Photoelectric smoke detector'),
('HTD', 'Heat Detector', 'Fire Detection', 'Fixed temperature heat detector'),
('FPU', 'Fire Pump', 'Fire Suppression', 'Electric fire water pump'),
('FEX', 'Fire Extinguisher', 'Fire Suppression', 'Portable fire extinguisher'),
('SPK', 'Sprinkler', 'Fire Suppression', 'Automatic fire sprinkler');

-- Locations
INSERT INTO ppm_locations (location_name, location_code, description) VALUES
('Building 1', 'B1', 'Main office building'),
('Building 2', 'B2', 'Secondary office building'),
('Building 5', 'B5', 'Warehouse building'),
('D44', 'D44', 'Residential block D44'),
('D45', 'D45', 'Residential block D45'),
('FM Building', 'FM', 'Facility management building'),
('Sales Center', 'SC', 'Sales and marketing center'),
('Pump Room', 'PR', 'Water pump station');
```

## 🔒 Security Setup

The system includes role-based access control. Set up RLS policies in Supabase:

```sql
-- Enable RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppm_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppm_findings ENABLE ROW LEVEL SECURITY;

-- Sample RLS policies (adjust based on your authentication system)
CREATE POLICY "Allow all operations for authenticated users" ON equipment
FOR ALL TO authenticated USING (true);
```

## 🎨 Customization

### Colors & Branding
The system uses your existing color scheme:
- **Critical**: Red (#DC2626)
- **High**: Orange (#F59E0B)
- **Medium**: Yellow (#3B82F6)
- **Low**: Green (#10B981)

### Adding More Equipment Types
Edit the sample data or add through the UI once database is connected.

### Modifying Workflows
Update the status options in the database schema and TypeScript types.

## 🚨 Production Checklist

Before deploying with real data:

1. ✅ Create all database tables
2. ✅ Insert initial equipment types and locations
3. ✅ Set up RLS policies
4. ✅ Configure user roles
5. ✅ Test all CRUD operations
6. ✅ Set up real-time subscriptions
7. ✅ Configure backup procedures

## 📞 Support

The system is designed to gracefully handle missing database tables by showing mock data. Once you set up the database schema, it will automatically start using real data from Supabase.

For any issues or questions, check the browser console for detailed error messages and warnings.

---

**Status**: ✅ Ready to use with demonstration data | ⚙️ Ready for database integration