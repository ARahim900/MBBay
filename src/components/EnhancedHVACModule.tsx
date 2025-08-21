import React, { useState, useEffect } from 'react';
import { Search, Edit, AlertTriangle, ChevronUp, ChevronDown, X, RefreshCw } from 'lucide-react';
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
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

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
            setSaveError(null);
            setSaveSuccess(false);
            setSaving(false);
        }
    }, [issue]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        
        try {
            console.log('=== MODAL SUBMIT DEBUG ===');
            console.log('Original issue from props:', issue);
            console.log('Form data:', formData);
            
            const updatedData = { 
                ...issue, 
                ...formData,
                updated_at: new Date().toISOString()
            };
            
            console.log('Final updated data being sent:', updatedData);
            
            await onSave(updatedData);
            setSaveSuccess(true);
            
            // Close modal after short delay to show success message
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error('Modal submit error:', error);
            setSaveError(error.message || 'Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
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

                    {/* Success/Error Messages */}
                    {saveError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {saveError}
                            </div>
                        </div>
                    )}
                    
                    {saveSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Changes saved successfully! Closing modal...
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button 
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 text-[#374151] border border-[#E5E7EB] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-[#10B981] text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {saving ? 'Saving...' : 'Save Changes'}
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
            console.log('Fetching HVAC issues from database...');
            
            // First, let's try to check if the table exists and what its structure is
            const { data: tableCheck, error: tableError } = await supabase
                .from('hvac_tracker')
                .select('*')
                .limit(1);
                
            if (tableError) {
                console.error('Table access error:', tableError);
                // Try alternative table names
                const { data: altData, error: altError } = await supabase
                    .from('hvac_maintenance_tracker')
                    .select('*')
                    .limit(1);
                    
                if (altError) {
                    console.error('Alternative table error:', altError);
                } else {
                    console.log('Found alternative table: hvac_maintenance_tracker');
                }
            } else {
                console.log('Table structure sample:', tableCheck);
            }
            
            const { data, error } = await supabase
                .from('hvac_tracker')
                .select('*')
                .order('updated_at', { ascending: false });
            
            if (error) {
                console.error('Database fetch error:', error);
                throw new Error(`Failed to fetch HVAC issues: ${error.message}`);
            }
            
            console.log(`Successfully fetched ${data?.length || 0} HVAC issues`);
            console.log('Sample record structure:', data?.[0]);
            setIssues(data || []);
        } catch (error: any) {
            console.error('Error fetching HVAC issues:', error);
            // You could add a toast notification here or set an error state
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
            console.log('=== HVAC SAVE DEBUG START ===');
            console.log('Original issue object:', updatedIssue);
            console.log('Issue ID:', updatedIssue?.id);
            console.log('Issue ID type:', typeof updatedIssue?.id);
            
            // Check if we have a valid ID
            if (!updatedIssue?.id) {
                throw new Error('No ID found in the issue data. Cannot update record.');
            }
            
            const id = updatedIssue.id;
            
            // First, let's check if the record exists
            const { data: existingRecord, error: fetchError } = await supabase
                .from('hvac_tracker')
                .select('*')
                .eq('id', id)
                .single();
                
            console.log('Existing record check:', existingRecord);
            console.log('Fetch error:', fetchError);
            
            if (fetchError || !existingRecord) {
                throw new Error(`Record with ID ${id} not found in database. ${fetchError?.message || ''}`);
            }
            
            // Create a clean update object with only the fields we want to update
            const updateData = {
                building: updatedIssue.building,
                main_system: updatedIssue.main_system,
                equipment_asset_id: updatedIssue.equipment_asset_id,
                finding_issue_description: updatedIssue.finding_issue_description,
                priority: updatedIssue.priority,
                status: updatedIssue.status,
                latest_update_notes: updatedIssue.latest_update_notes,
                updated_at: new Date().toISOString()
            };
            
            console.log('Clean update data:', updateData);
            
            // Try the simplest possible update first - without .select()
            const { error: updateError } = await supabase
                .from('hvac_tracker')
                .update(updateData)
                .eq('id', id);
            
            console.log('Simple update error:', updateError);
            
            if (updateError) {
                throw new Error(`Database update failed: ${updateError.message}`);
            }
            
            console.log('Simple update succeeded, now fetching updated record...');
            
            // Fetch the updated record
            const { data: updatedRecord, error: fetchUpdatedError } = await supabase
                .from('hvac_tracker')
                .select('*')
                .eq('id', id)
                .single();
                
            console.log('Fetched updated record:', updatedRecord);
            console.log('Fetch updated error:', fetchUpdatedError);
            
            if (fetchUpdatedError || !updatedRecord) {
                console.warn('Update succeeded but could not fetch updated record');
                // Still update local state with our data
                const mergedData = { ...existingRecord, ...updateData };
                setIssues(issues.map(issue => 
                    issue.id === id ? mergedData : issue
                ));
                return mergedData;
            }
            
            console.log('Successfully updated and fetched issue:', updatedRecord);
            console.log('=== HVAC SAVE DEBUG END ===');
            
            // Update local state with the fetched data
            setIssues(issues.map(issue => 
                issue.id === id ? updatedRecord : issue
            ));
            
            return updatedRecord;
            
        } catch (error: any) {
            console.error('Error updating HVAC issue:', error);
            throw error; // Re-throw to be handled by the modal
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#1F2937]">HVAC System Maintenance Tracker</h1>
                            <p className="text-sm text-[#6B7280]">
                                {issues.length > 0 ? `${issues.length} maintenance issues tracked` : 'Real-time maintenance tracking'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchIssues}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </button>
                        <button
                            onClick={async () => {
                                console.log('=== DATABASE TEST ===');
                                try {
                                    const { data, error } = await supabase
                                        .from('hvac_tracker')
                                        .select('*')
                                        .limit(1);
                                    console.log('Test query result:', { data, error });
                                    if (data && data.length > 0) {
                                        console.log('Sample record for debugging:', data[0]);
                                        alert(`Database connected! Found ${issues.length} records. Check console for details.`);
                                    } else {
                                        alert('Database connected but no records found.');
                                    }
                                } catch (error) {
                                    console.error('Database test failed:', error);
                                    alert('Database test failed. Check console for details.');
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                        >
                            Test DB
                        </button>
                    </div>
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