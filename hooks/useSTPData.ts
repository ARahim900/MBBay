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
      
      // Set fallback data if fetch fails - Sample data for testing
      const fallbackData = [
        {
          id: 1,
          operation_date: '2024-07-15',
          total_inlet_sewage: 85,
          tse_water_to_irrigation: 75,
          tankers_discharged: 3,
          income_from_tankers: 15.00,
          saving_from_tse: 33.75,
          total_saving_income: 48.75
        },
        {
          id: 2,
          operation_date: '2024-08-10',
          total_inlet_sewage: 92,
          tse_water_to_irrigation: 82,
          tankers_discharged: 4,
          income_from_tankers: 20.00,
          saving_from_tse: 36.90,
          total_saving_income: 56.90
        },
        {
          id: 3,
          operation_date: '2024-09-05',
          total_inlet_sewage: 78,
          tse_water_to_irrigation: 68,
          tankers_discharged: 2,
          income_from_tankers: 10.00,
          saving_from_tse: 30.60,
          total_saving_income: 40.60
        }
      ];
      console.log('Using fallback data due to error:', errorMessage);
      setAllData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter data based on current date range
  const filteredData = useMemo(() => {
    return allData.filter(record => {
      const recordDate = new Date(record.operation_date);
      const startDate = new Date(dateRange.start + '-01');
      const endDate = new Date(dateRange.end + '-31'); // End of month
      return recordDate >= startDate && recordDate <= endDate;
    });
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
    console.log('Monthly data processed:', result.length, 'months');
    console.log('Sample monthly data:', result.slice(0, 2));
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