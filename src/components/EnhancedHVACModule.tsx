import React, { useState, useEffect } from 'react';
import { Search, Edit, AlertTriangle, ChevronUp, ChevronDown, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Edit Modal Component
const EditModal = ({ issue, isOpen, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        building: '',
        main_system: '',
        equipment_asset_id: '',
        finding_issue_description: '',
        priority: 'Medium',
        status: 'Open - Action Required',
        latest_update_notes: ''
    });

    useEffect(() => {
        if (issue) {
            setFormData({
                building: issue.building || '',
                main_system: issue.main_system || '',
                equipment_asset_id: issue.equipment_asset_id || '',
                finding_issue_description: issue.finding_issue_description || '',
                priority: issue.priority || 'Medium',
                status: issue.status || 'Open - Action Required',
                latest_update_notes: issue.latest_update_notes || ''
            });
        }
    }, [issue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...issue, ...formData });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#2C2834] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#1F2937] dark:text-white">Edit HVAC Issue</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-1">
                                Building
                            </label>
                            <select 
                                value={formData.building}
                                onChange={(e) => setFormData({...formData, building: e.target.value})}
                                className="w-full p-2 border border-[#E5E7EB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Building</option>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="B3">B3</option>
                                <option value="B4">B4</option>
                                <option value="B5">B5</option>
                                <option value="B6">B6</option>
                                <option value="B7">B7</option>
                                <option value="B8">B8</option>
                                <option value="FM">FM</option>
                                <option value="CIF">CIF</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-1">
                                Main System
                            </label>
                            <select 
                                value={formData.main_system}
                                onChange={(e) => setFormData({...formData, main_system: e.target.value})}
                                className="w-full p-2 border border-[#E5E7EB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select System</option>
                                <option value="York Chiller">York Chiller</option>
                                <option value="Pressurizations">Pressurizations</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-1">
                            Equipment
                        </label>
                        <input 
                            type="text"
                            value={formData.equipment_asset_id}
                            onChange={(e) => setFormData({...formData, equipment_asset_id: e.target.value})}
                            className="w-full p-2 border border-[#E5E7EB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Chiller #1, Pressurization Unit #3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-1">
                            Issue Description
                        </label>
                        <textarea 
                            value={formData.finding_issue_description}
                            onChange={(e) => setFormData({...formData, finding_issue_description: e.target.value})}
                            className="w-full p-2 border border-[#E5E7EB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Describe the issue..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-1">
                                Priority
                            </label>
                            <select 
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                className="w-full p-2 border border-[#E5E7EB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full p-2 border border-[#E5E7EB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Open - Action Required">Open - Action Required</option>
                                <option value="Quote Submitted / Awaiting LPO">Quote Submitted / Awaiting LPO</option>
                                <option value="Closed - Verified">Closed - Verified</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-1">
                            Notes
                        </label>
                        <textarea 
                            value={formData.latest_update_notes}
                            onChange={(e) => setFormData({...formData, latest_update_notes: e.target.value})}
                            className="w-full p-2 border border-[#E5E7EB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Additional notes or updates..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[#374151] border border-[#E5E7EB] rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-[#10B981] text-white rounded-md hover:bg-green-600"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main HVAC Maintenance Tracker Component
export const EnhancedHVACModule = () => {
    const [issues, setIssues] = useState<any[]>([]);
    const [filteredIssues, setFilteredIssues] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('building');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState(true);
    const [editingIssue, setEditingIssue] = useState<any>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const itemsPerPage = 10;

    useEffect(() => {
        fetchIssues();
    }, []);

    useEffect(() => {
        filterAndSortIssues();
    }, [issues, searchTerm, sortField, sortDirection]);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('hvac_tracker')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setIssues(data || []);
        } catch (error) {
            console.error('Error fetching HVAC issues:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortIssues = () => {
        let filtered = issues;

        // Search filter
        if (searchTerm) {
            filtered = issues.filter(issue => 
                Object.values(issue).some(value => 
                    value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Sort
        filtered.sort((a, b) => {
            const aVal = a[sortField]?.toString().toLowerCase() || '';
            const bVal = b[sortField]?.toString().toLowerCase() || '';
            
            if (sortDirection === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });

        setFilteredIssues(filtered);
        setCurrentPage(1);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleEdit = (issue: any) => {
        setEditingIssue(issue);
        setShowEditModal(true);
    };

    const handleSave = async (updatedIssue: any) => {
        try {
            const { error } = await supabase
                .from('hvac_tracker')
                .update(updatedIssue)
                .eq('id', updatedIssue.id);
            
            if (error) throw error;
            
            // Update local state
            setIssues(issues.map(issue => 
                issue.id === updatedIssue.id ? updatedIssue : issue
            ));
            
        } catch (error) {
            console.error('Error updating issue:', error);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    const truncateText = (text: string, maxLength: number = 50) => {
        if (!text) return 'No notes available';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const getPriorityIndicator = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return <span className="w-2 h-2 bg-red-500 rounded-full inline-block mr-2"></span>;
            case 'high':
                return <span className="w-2 h-2 bg-orange-500 rounded-full inline-block mr-2"></span>;
            default:
                return null;
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageData = filteredIssues.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-[#6B7280]">Loading HVAC maintenance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[#1F2937]">HVAC System Maintenance Tracker</h1>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-4 mb-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search across all fields..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <button 
                        onClick={resetFilters}
                        className="bg-[#4A5568] text-white px-4 py-2 rounded-md hover:bg-[#2D3748] text-sm font-medium"
                    >
                        Reset Filters
                    </button>
                </div>
                <div className="mt-3 text-sm text-[#6B7280]">
                    Showing {filteredIssues.length} of {issues.length} entries
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-[#E5E7EB]">
                            <tr>
                                {[
                                    { key: 'building', label: 'Building' },
                                    { key: 'main_system', label: 'Main System' },
                                    { key: 'equipment_asset_id', label: 'Equipment' },
                                    { key: 'finding_issue_description', label: 'Common Issues' },
                                    { key: 'latest_update_notes', label: 'Notes' },
                                    { key: 'actions', label: 'Actions' }
                                ].map(({ key, label }) => (
                                    <th key={key} className="px-3 py-3 text-left">
                                        {key !== 'actions' ? (
                                            <button
                                                onClick={() => handleSort(key)}
                                                className="flex items-center gap-1 text-xs font-medium text-[#374151] uppercase tracking-wider hover:text-[#1F2937]"
                                            >
                                                {label}
                                                {sortField === key && (
                                                    sortDirection === 'asc' ? 
                                                    <ChevronUp className="w-3 h-3" /> : 
                                                    <ChevronDown className="w-3 h-3" />
                                                )}
                                            </button>
                                        ) : (
                                            <span className="text-xs font-medium text-[#374151] uppercase tracking-wider">
                                                {label}
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                            {currentPageData.map((issue, index) => (
                                <tr key={issue.id} className="hover:bg-[#F9FAFB] transition-colors">
                                    <td className="px-3 py-3 text-sm font-medium text-[#1F2937]">
                                        {issue.building}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-[#374151]">
                                        {issue.main_system}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-[#374151]">
                                        {issue.equipment_asset_id}
                                    </td>
                                    <td className="px-3 py-3 text-sm">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                                            <span className="text-[#F59E0B]">
                                                {truncateText(issue.finding_issue_description)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-[#6B7280]">
                                        {truncateText(issue.latest_update_notes || issue.action_required)}
                                    </td>
                                    <td className="px-3 py-3 text-sm">
                                        <button
                                            onClick={() => handleEdit(issue)}
                                            className="bg-[#10B981] text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors flex items-center gap-1 text-xs font-medium"
                                        >
                                            <Edit className="w-3 h-3" />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white border-t border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
                    <div className="text-sm text-[#6B7280]">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditModal 
                issue={editingIssue}
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingIssue(null);
                }}
                onSave={handleSave}
            />
        </div>
    );
};