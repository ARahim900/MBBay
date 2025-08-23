import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, ArrowUpDown, Filter } from 'lucide-react';
import type { PPMFinding } from '../../types/firefighting';
import { theme, getThemeValue } from '../../lib/theme';
import { Button } from '../ui';

interface FindingsTableProps {
  findings: PPMFinding[];
  showPagination?: boolean;
  compact?: boolean;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({ 
  findings, 
  showPagination = true,
  compact = false 
}) => {
  const [sortField, setSortField] = useState<keyof PPMFinding>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = compact ? 5 : 10;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return {
        backgroundColor: `${theme.colors.status.error}15`,
        color: theme.colors.status.error,
        borderColor: `${theme.colors.status.error}33`
      };
      case 'High': return {
        backgroundColor: `${theme.colors.status.warning}15`,
        color: theme.colors.status.warning,
        borderColor: `${theme.colors.status.warning}33`
      };
      case 'Medium': return {
        backgroundColor: `${theme.colors.extended.orange}15`,
        color: theme.colors.extended.orange,
        borderColor: `${theme.colors.extended.orange}33`
      };
      case 'Low': return {
        backgroundColor: `${theme.colors.status.info}15`,
        color: theme.colors.status.info,
        borderColor: `${theme.colors.status.info}33`
      };
      default: return {
        backgroundColor: `${theme.colors.gray[500]}15`,
        color: theme.colors.gray[500],
        borderColor: `${theme.colors.gray[500]}33`
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <XCircle className="h-4 w-4" style={{ color: theme.colors.status.error }} />;
      case 'In Progress': return <Clock className="h-4 w-4" style={{ color: theme.colors.status.warning }} />;
      case 'Closed': return <CheckCircle className="h-4 w-4" style={{ color: theme.colors.status.success }} />;
      default: return <AlertTriangle className="h-4 w-4" style={{ color: theme.colors.gray[500] }} />;
    }
  };

  const handleSort = (field: keyof PPMFinding) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredFindings = findings.filter(finding => {
    if (filterSeverity && finding.severity !== filterSeverity) return false;
    if (filterStatus && finding.status !== filterStatus) return false;
    return true;
  });

  const sortedFindings = [...filteredFindings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedFindings = showPagination 
    ? sortedFindings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedFindings;

  const totalPages = Math.ceil(sortedFindings.length / itemsPerPage);

  if (findings.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: theme.colors.status.success }} />
        <p style={{ color: theme.colors.textSecondary, fontSize: theme.typography.labelSize }}>No findings to display</p>
        <p style={{ color: theme.colors.gray[500], fontSize: theme.typography.tooltipSize }}>All systems are operating normally</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
              style={{
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.labelSize,
                fontFamily: theme.typography.fontFamily
              }}
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
            style={{
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.labelSize,
              fontFamily: theme.typography.fontFamily
            }}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ fontSize: theme.typography.labelSize, fontFamily: theme.typography.fontFamily }}>
          <thead style={{ 
            fontSize: theme.typography.tooltipSize, 
            color: theme.colors.textSecondary,
            backgroundColor: theme.colors.gray[50]
          }} className="uppercase dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3">
                <button
                  onClick={() => handleSort('severity')}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                  style={{ 
                    fontSize: theme.typography.tooltipSize,
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: theme.typography.fontWeight.medium
                  }}
                >
                  Severity
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              {!compact && (
                <>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedFindings.map((finding) => (
              <tr key={finding.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3">
                  <span 
                    className="px-2 py-1 text-xs rounded-full border"
                    style={{
                      ...getSeverityColor(finding.severity),
                      fontSize: theme.typography.tooltipSize,
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: theme.typography.fontWeight.medium,
                      borderRadius: theme.borderRadius.full
                    }}
                  >
                    {finding.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {finding.finding_description}
                    </p>
                    {finding.recommended_action && !compact && (
                      <p className="text-xs text-gray-500 truncate">
                        {finding.recommended_action}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-600 dark:text-gray-300">
                    {finding.ppm_record?.location?.location_name || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(finding.status)}
                    <span className="text-gray-600 dark:text-gray-300">
                      {finding.status}
                    </span>
                  </div>
                </td>
                {!compact && (
                  <>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-300">
                        {finding.estimated_cost ? `OMR ${finding.estimated_cost.toLocaleString()}` : 'TBD'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-300">
                        {finding.created_at ? new Date(finding.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedFindings.length)} of {sortedFindings.length} findings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};