import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../src/lib/supabase';

export interface STPRecord {
  id: number;
  operation_date: string;
  total_inlet_sewage: number;
  tse_water_to_irrigation: number;
  tankers_discharged: number;
  income_from_tankers: number;
  saving_from_tse: number;
  total_saving_income: number;
}

export interface STPMetrics {
  totalInletSewage: number;
  totalTSE: number;
  totalTankers: number;
  totalIncome: number;
  totalSavings: number;
  totalImpact: number;
}

export interface MonthlyData {
  month: string;
  sewageInput: number;
  tseOutput: number;
  tankerTrips: number;
  income: number;
  savings: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export const useSTPData = () => {
  const [allData, setAllData] = useState<STPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2024-07',
    end: '2025-07'
  });

  // Available date range for the slider
  const availableDates = useMemo(() => [
    '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07'
  ], []);

  // Fetch all data once and filter client-side for better performance
  const fetchAllSTPData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if supabase is properly initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data: fetchedData, error: fetchError } = await supabase
        .from('stp_operations')
        .select('*')
        .gte('operation_date', '2024-07-01')
        .lte('operation_date', '2025-07-31')
        .order('operation_date', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      // Auto-calculate financial fields if null
      const processedData = (fetchedData || []).map(record => ({
        ...record,
        income_from_tankers: record.income_from_tankers || (record.tankers_discharged * 5), // 5 OMR per tanker
        saving_from_tse: record.saving_from_tse || (record.tse_water_to_irrigation * 0.45), // 0.45 OMR per m³
        total_saving_income: record.total_saving_income || 
          ((record.income_from_tankers || (record.tankers_discharged * 5)) + 
           (record.saving_from_tse || (record.tse_water_to_irrigation * 0.45)))
      }));

      console.log('STP data fetched successfully:', processedData.length, 'records');
      console.log('Sample data:', processedData.slice(0, 3));
      console.log('Date range of data:', processedData.length > 0 ? {
        earliest: processedData[processedData.length - 1]?.operation_date,
        latest: processedData[0]?.operation_date
      } : 'No data');
      setAllData(processedData);
      setLastFetchTime(new Date());
    } catch (err) {
      console.error('Error fetching STP data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      
      // Set comprehensive fallback data covering the full date range for testing
      const fallbackData = [
        // July 2024
        { id: 1, operation_date: '2024-07-05', total_inlet_sewage: 85, tse_water_to_irrigation: 75, tankers_discharged: 3, income_from_tankers: 15.00, saving_from_tse: 33.75, total_saving_income: 48.75 },
        { id: 2, operation_date: '2024-07-15', total_inlet_sewage: 92, tse_water_to_irrigation: 82, tankers_discharged: 4, income_from_tankers: 20.00, saving_from_tse: 36.90, total_saving_income: 56.90 },
        { id: 3, operation_date: '2024-07-25', total_inlet_sewage: 78, tse_water_to_irrigation: 68, tankers_discharged: 2, income_from_tankers: 10.00, saving_from_tse: 30.60, total_saving_income: 40.60 },
        
        // August 2024
        { id: 4, operation_date: '2024-08-08', total_inlet_sewage: 88, tse_water_to_irrigation: 79, tankers_discharged: 5, income_from_tankers: 25.00, saving_from_tse: 35.55, total_saving_income: 60.55 },
        { id: 5, operation_date: '2024-08-18', total_inlet_sewage: 95, tse_water_to_irrigation: 85, tankers_discharged: 3, income_from_tankers: 15.00, saving_from_tse: 38.25, total_saving_income: 53.25 },
        
        // September 2024
        { id: 6, operation_date: '2024-09-12', total_inlet_sewage: 82, tse_water_to_irrigation: 72, tankers_discharged: 4, income_from_tankers: 20.00, saving_from_tse: 32.40, total_saving_income: 52.40 },
        
        // October 2024
        { id: 7, operation_date: '2024-10-07', total_inlet_sewage: 90, tse_water_to_irrigation: 80, tankers_discharged: 6, income_from_tankers: 30.00, saving_from_tse: 36.00, total_saving_income: 66.00 },
        { id: 8, operation_date: '2024-10-20', total_inlet_sewage: 87, tse_water_to_irrigation: 77, tankers_discharged: 3, income_from_tankers: 15.00, saving_from_tse: 34.65, total_saving_income: 49.65 },
        
        // November 2024
        { id: 9, operation_date: '2024-11-14', total_inlet_sewage: 93, tse_water_to_irrigation: 83, tankers_discharged: 5, income_from_tankers: 25.00, saving_from_tse: 37.35, total_saving_income: 62.35 },
        
        // December 2024
        { id: 10, operation_date: '2024-12-03', total_inlet_sewage: 86, tse_water_to_irrigation: 76, tankers_discharged: 4, income_from_tankers: 20.00, saving_from_tse: 34.20, total_saving_income: 54.20 },
        { id: 11, operation_date: '2024-12-22', total_inlet_sewage: 91, tse_water_to_irrigation: 81, tankers_discharged: 7, income_from_tankers: 35.00, saving_from_tse: 36.45, total_saving_income: 71.45 },
        
        // January 2025
        { id: 12, operation_date: '2025-01-10', total_inlet_sewage: 89, tse_water_to_irrigation: 79, tankers_discharged: 4, income_from_tankers: 20.00, saving_from_tse: 35.55, total_saving_income: 55.55 },
        { id: 13, operation_date: '2025-01-25', total_inlet_sewage: 94, tse_water_to_irrigation: 84, tankers_discharged: 6, income_from_tankers: 30.00, saving_from_tse: 37.80, total_saving_income: 67.80 },
        
        // February 2025
        { id: 14, operation_date: '2025-02-08', total_inlet_sewage: 88, tse_water_to_irrigation: 78, tankers_discharged: 3, income_from_tankers: 15.00, saving_from_tse: 35.10, total_saving_income: 50.10 },
        
        // March 2025
        { id: 15, operation_date: '2025-03-15', total_inlet_sewage: 92, tse_water_to_irrigation: 82, tankers_discharged: 5, income_from_tankers: 25.00, saving_from_tse: 36.90, total_saving_income: 61.90 },
        
        // April 2025
        { id: 16, operation_date: '2025-04-12', total_inlet_sewage: 87, tse_water_to_irrigation: 77, tankers_discharged: 4, income_from_tankers: 20.00, saving_from_tse: 34.65, total_saving_income: 54.65 },
        
        // May 2025
        { id: 17, operation_date: '2025-05-20', total_inlet_sewage: 96, tse_water_to_irrigation: 86, tankers_discharged: 6, income_from_tankers: 30.00, saving_from_tse: 38.70, total_saving_income: 68.70 },
        
        // June 2025
        { id: 18, operation_date: '2025-06-18', total_inlet_sewage: 90, tse_water_to_irrigation: 80, tankers_discharged: 5, income_from_tankers: 25.00, saving_from_tse: 36.00, total_saving_income: 61.00 },
        
        // July 2025
        { id: 19, operation_date: '2025-07-10', total_inlet_sewage: 93, tse_water_to_irrigation: 83, tankers_discharged: 4, income_from_tankers: 20.00, saving_from_tse: 37.35, total_saving_income: 57.35 }
      ];
      console.log('Using fallback data due to error:', errorMessage);
      setAllData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter data based on current date range - Fixed filtering logic
  const filteredData = useMemo(() => {
    if (!allData || allData.length === 0) {
      console.log('No data to filter');
      return [];
    }
    
    const filtered = allData.filter(record => {
      const recordDate = new Date(record.operation_date);
      const startDate = new Date(dateRange.start + '-01');
      const endDate = new Date(dateRange.end + '-31'); // End of month
      const isInRange = recordDate >= startDate && recordDate <= endDate;
      return isInRange;
    });
    
    console.log(`Filtering data: ${allData.length} total records, ${filtered.length} in range ${dateRange.start} to ${dateRange.end}`);
    return filtered;
  }, [allData, dateRange]);

  // Calculate metrics based on filtered data
  const metrics: STPMetrics = useMemo(() => {
    return {
      totalInletSewage: filteredData.reduce((sum, d) => sum + (Number(d.total_inlet_sewage) || 0), 0),
      totalTSE: filteredData.reduce((sum, d) => sum + (Number(d.tse_water_to_irrigation) || 0), 0),
      totalTankers: filteredData.reduce((sum, d) => sum + (d.tankers_discharged || 0), 0),
      totalIncome: filteredData.reduce((sum, d) => sum + (Number(d.income_from_tankers) || 0), 0),
      totalSavings: filteredData.reduce((sum, d) => sum + (Number(d.saving_from_tse) || 0), 0),
      totalImpact: filteredData.reduce((sum, d) => sum + (Number(d.total_saving_income) || 0), 0)
    };
  }, [filteredData]);

  // Group filtered data by month for charts
  const monthlyData: MonthlyData[] = useMemo(() => {
    const grouped = filteredData.reduce((acc: any, record) => {
      const month = new Date(record.operation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!acc[month]) {
        acc[month] = {
          month,
          sewageInput: 0,
          tseOutput: 0,
          tankerTrips: 0,
          income: 0,
          savings: 0
        };
      }
      acc[month].sewageInput += Number(record.total_inlet_sewage) || 0;
      acc[month].tseOutput += Number(record.tse_water_to_irrigation) || 0;
      acc[month].tankerTrips += record.tankers_discharged || 0;
      acc[month].income += Number(record.income_from_tankers) || 0;
      acc[month].savings += Number(record.saving_from_tse) || 0;
      return acc;
    }, {});

    const result = Object.values(grouped).sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());
    console.log('=== MONTHLY DATA PROCESSING ===');
    console.log('Filtered records used:', filteredData.length);
    console.log('Monthly data processed:', result.length, 'months');
    console.log('Monthly data structure:', result.slice(0, 2));
    console.log('All monthly data for charts:', result);
    console.log('================================');
    return result;
  }, [filteredData]);

  // Enhanced date range change handler
  const handleDateRangeChange = useCallback((newRange: DateRange) => {
    setDateRange(newRange);
  }, []);

  // Auto-refresh data
  useEffect(() => {
    fetchAllSTPData();
    const interval = setInterval(fetchAllSTPData, 5 * 60 * 1000); // Auto-refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchAllSTPData]);

  return {
    // Data
    allData,
    filteredData,
    monthlyData,
    
    // State
    loading,
    error,
    lastFetchTime,
    dateRange,
    availableDates,
    
    // Computed values
    metrics,
    
    // Actions
    handleDateRangeChange,
    refetch: fetchAllSTPData
  };
};