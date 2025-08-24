# Contractor Export and Reporting Implementation

## Overview

This document describes the implementation of export and reporting functionality for the contractor tracker system. The implementation provides comprehensive data export capabilities in multiple formats, advanced filtering options, and compliance reporting features.

## Requirements Coverage

- **2.5**: Export and reporting functionality with filtered export options
- **6.4**: Data export with proper formatting and validation
- **10.4**: Secure data handling during export operations

## Architecture

### Core Components

1. **Export Utilities** (`src/utils/contractor-export.ts`)
   - CSV export with custom field selection
   - JSON export with metadata
   - Compliance report generation
   - Data filtering and validation

2. **Export Modal** (`src/components/contractor/ExportModal.tsx`)
   - User interface for export configuration
   - Format selection (CSV, JSON, Compliance Report)
   - Field selection and filtering options
   - Export preview and statistics

3. **Integration Points**
   - ContractorTrackerDashboard export button
   - ContractorDataTable export functionality
   - Real-time data filtering and preview

## Features

### Export Formats

#### 1. CSV Export
- **Purpose**: Spreadsheet-compatible format for data analysis
- **Features**:
  - Custom field selection
  - Proper CSV escaping for special characters
  - Date formatting for readability
  - Null value handling

```typescript
const csvData = exportToCSV(contractors, {
  includeFields: ['contractor_name', 'status', 'contract_yearly_amount']
});
```

#### 2. JSON Export
- **Purpose**: Structured data format for system integration
- **Features**:
  - Complete data structure with metadata
  - Export timestamp and user information
  - Filter state preservation
  - Pretty-printed formatting option

```typescript
const exportData = createExportData(
  contractors,
  summary,
  expiringContracts,
  contractsByService,
  filters,
  'json'
);
const jsonData = exportToJSON(exportData, true);
```

#### 3. Compliance Report
- **Purpose**: Comprehensive analysis for compliance management
- **Features**:
  - Contract compliance status analysis
  - Risk level assessment
  - Expiration urgency categorization
  - Automated recommendations
  - Service breakdown analysis

```typescript
const complianceReport = generateComplianceReport(
  contractors,
  expiringContracts,
  contractsByService,
  summary,
  reportPeriod
);
```

### Filtering Options

#### 1. Current Filter Integration
- Applies active search and filter settings
- Maintains user's current view context
- Real-time preview updates

#### 2. Custom Date Range
- Contract period overlap detection
- Flexible date range selection
- Historical data analysis

#### 3. Advanced Filtering
- Status-based filtering (Active, Expired, Pending)
- Contract type filtering (Contract, PO)
- Service category filtering
- Search term filtering across multiple fields

### Data Security

#### 1. Input Validation
- Export option validation
- Date range validation
- Field selection validation
- Error handling and user feedback

#### 2. Data Sanitization
- CSV injection prevention
- Special character escaping
- Null value handling
- Data type validation

#### 3. Secure File Handling
- Client-side file generation
- Temporary URL cleanup
- Memory management
- No server-side storage

## Implementation Details

### Export Utilities

#### CSV Export Function
```typescript
export const exportToCSV = (
  contractors: Contractor[],
  options: Partial<ContractorExportOptions> = {}
): string => {
  const includeFields = options.includeFields || defaultFields;
  
  // Create headers with user-friendly names
  const headers = includeFields.map(field => getFieldLabel(field));
  
  // Process data rows with proper formatting
  const rows = contractors.map(contractor => {
    return includeFields.map(field => {
      const value = contractor[field];
      return formatFieldValue(value, field);
    });
  });
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};
```

#### Compliance Report Generation
```typescript
export const generateComplianceReport = (
  contractors: Contractor[],
  expiringContracts: ExpiringContract[],
  contractsByService: ServiceContract[],
  summary: ContractorSummary,
  reportPeriod?: { startDate: string; endDate: string }
): ComplianceReportData => {
  // Calculate compliance metrics
  const complianceRate = (summary.active_contracts / summary.total_contracts) * 100;
  
  // Analyze contract details with risk assessment
  const contractDetails = contractors.map(contractor => ({
    ...contractor,
    complianceStatus: calculateComplianceStatus(contractor),
    riskLevel: assessRiskLevel(contractor)
  }));
  
  // Generate recommendations based on analysis
  const recommendations = generateRecommendations(
    summary,
    expiringContracts,
    complianceRate
  );
  
  return {
    reportTitle: 'Contractor Compliance Report',
    reportDate: new Date().toISOString(),
    reportPeriod: reportPeriod || getDefaultPeriod(),
    summary: {
      totalContracts: summary.total_contracts,
      activeContracts: summary.active_contracts,
      expiredContracts: summary.expired_contracts,
      expiringContracts: expiringContracts.length,
      complianceRate,
      totalValue: summary.total_yearly_value
    },
    contractDetails,
    expirationAnalysis: analyzeExpirationUrgency(expiringContracts),
    serviceBreakdown: contractsByService,
    recommendations
  };
};
```

### Export Modal Component

#### Format Selection
```typescript
const formatOptions = [
  {
    value: 'csv',
    label: 'CSV',
    description: 'Spreadsheet format',
    icon: FileSpreadsheet,
    color: 'green'
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Structured data',
    icon: FileJson,
    color: 'blue'
  },
  {
    value: 'compliance',
    label: 'Compliance Report',
    description: 'Full analysis',
    icon: BarChart3,
    color: 'purple'
  }
];
```

#### Field Selection Interface
```typescript
const FieldSelector = () => {
  return (
    <div className="max-h-48 overflow-y-auto">
      {availableFields.map(field => (
        <label key={field.key} className="flex items-center gap-3">
          <Checkbox
            checked={includeFields.includes(field.key)}
            onChange={() => handleFieldToggle(field.key)}
          />
          <div>
            <div className="font-medium">{field.label}</div>
            <div className="text-sm text-gray-500">{field.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
};
```

#### Export Preview
```typescript
const ExportPreview = ({ filteredData }: { filteredData: Contractor[] }) => {
  const stats = getExportStatistics(filteredData);
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium mb-3">Export Preview</h4>
      <div className="grid grid-cols-4 gap-4">
        <StatItem label="Total Records" value={stats.totalRecords} />
        <StatItem label="Active" value={stats.activeContracts} color="green" />
        <StatItem label="Expired" value={stats.expiredContracts} color="red" />
        <StatItem label="Total Value" value={`OMR ${stats.totalValue.toLocaleString()}`} />
      </div>
    </div>
  );
};
```

### Integration with Dashboard

#### Export Button Integration
```typescript
const ContractorTrackerDashboard = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const handleExportReport = () => {
    setIsExportModalOpen(true);
  };
  
  return (
    <div>
      {/* Dashboard content */}
      
      <Button onClick={handleExportReport} variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </Button>
      
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        contractors={allData}
        summary={summary}
        expiringContracts={expiringContracts}
        contractsByService={contractsByService}
        currentFilters={filters}
      />
    </div>
  );
};
```

## Usage Examples

### Basic CSV Export
```typescript
// Export all contractors to CSV
const csvData = exportToCSV(contractors);
downloadFile(csvData, 'contractors.csv', 'text/csv');
```

### Filtered JSON Export
```typescript
// Export filtered data with metadata
const filteredContractors = filterContractorsForExport(contractors, {
  status: 'Active',
  search: 'maintenance',
  contractType: 'Contract'
});

const exportData = createExportData(
  filteredContractors,
  summary,
  expiringContracts,
  contractsByService,
  filters
);

const jsonData = exportToJSON(exportData);
downloadFile(jsonData, 'active-contractors.json', 'application/json');
```

### Compliance Report Generation
```typescript
// Generate comprehensive compliance report
const complianceReport = generateComplianceReport(
  contractors,
  expiringContracts,
  contractsByService,
  summary,
  {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
);

const reportJson = JSON.stringify(complianceReport, null, 2);
downloadFile(reportJson, 'compliance-report.json', 'application/json');
```

## Testing

### Unit Tests
- CSV export formatting
- JSON structure validation
- Compliance report calculations
- Filtering logic verification
- Validation function testing

### Integration Tests
- Complete export workflow
- Modal interaction testing
- Data consistency verification
- Error handling validation

### Validation Script
```bash
# Run export validation
npm run validate:export

# Run unit tests
npm test contractor-export
```

## Performance Considerations

### Memory Management
- Streaming for large datasets
- Efficient data processing
- Temporary object cleanup
- Browser memory limits

### User Experience
- Progress indicators for large exports
- Responsive UI during processing
- Error handling and recovery
- Export preview and validation

## Security Considerations

### Data Protection
- Client-side processing only
- No server-side data storage
- Secure file download handling
- Input validation and sanitization

### Access Control
- User permission validation
- Audit logging for exports
- Data filtering based on access rights
- Secure error messages

## Future Enhancements

### Additional Formats
- Excel (XLSX) export support
- PDF report generation
- Email delivery integration
- Scheduled export functionality

### Advanced Features
- Custom report templates
- Data visualization exports
- Bulk export operations
- Export history tracking

## Troubleshooting

### Common Issues

1. **Large Dataset Performance**
   - Solution: Implement pagination or streaming
   - Workaround: Filter data before export

2. **Browser Compatibility**
   - Solution: Feature detection and fallbacks
   - Workaround: Provide alternative download methods

3. **Memory Limitations**
   - Solution: Process data in chunks
   - Workaround: Reduce field selection

### Error Handling

```typescript
try {
  const exportData = await generateExport(options);
  downloadFile(exportData.content, exportData.filename, exportData.mimeType);
} catch (error) {
  console.error('Export failed:', error);
  showErrorMessage('Export failed. Please try again or contact support.');
}
```

## Conclusion

The contractor export and reporting functionality provides comprehensive data export capabilities with multiple formats, advanced filtering, and compliance reporting. The implementation ensures data security, user-friendly interface, and extensible architecture for future enhancements.

Key benefits:
- Multiple export formats (CSV, JSON, Compliance Report)
- Advanced filtering and field selection
- Real-time preview and statistics
- Comprehensive compliance analysis
- Secure client-side processing
- Extensible architecture for future features