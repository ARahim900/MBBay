import { supabase, type WaterMeter } from './supabase'

export const fetchWaterMeters = async (): Promise<WaterMeter[]> => {
  console.log('=== SUPABASE CONNECTION TEST ===')
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('Supabase Key (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
  
  try {
    const { data, error } = await supabase
      .from('water_meters')
      .select('*')
      .order('id')

    if (error) {
      console.error('=== SUPABASE ERROR ===')
      console.error('Error details:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      
      // Return empty array for graceful fallback
      console.log('Returning empty array as fallback')
      return []
    }

    console.log('=== SUPABASE SUCCESS ===')
    console.log('Data fetched successfully, total records:', data?.length || 0)
    
    return data || []
  } catch (networkError) {
    console.error('=== NETWORK ERROR ===')
    console.error('Network error:', networkError)
    console.log('Returning empty array as fallback')
    return []
  }
}

export const calculateWaterMetricsForRange = (meters: WaterMeter[], startMonth = 0, endMonth = 6) => {
  if (!meters || meters.length === 0) {
    console.warn('No meters data available for calculation')
    return {
      totalMeters: 0,
      l1Count: 0,
      l2Count: 0,
      l3Count: 0,
      l4Count: 0,
      dcCount: 0,
      A1: 0,
      A2: 0,
      A3_Individual: 0,
      A4: 0,
      Stage1_Loss: 0,
      Stage2_Loss: 0,
      Stage3_Loss: 0,
      Total_Loss: 0,
      Stage1_Loss_Percentage: 0,
      Stage2_Loss_Percentage: 0,
      Stage3_Loss_Percentage: 0,
      Total_Loss_Percentage: 0
    }
  }

  const monthColumns = ['jan_25', 'feb_25', 'mar_25', 'apr_25', 'may_25', 'jun_25', 'jul_25']
  const selectedMonths = monthColumns.slice(startMonth, endMonth + 1)

  const sumForMonths = (meter: WaterMeter) => {
    return selectedMonths.reduce((sum, month) => {
      const value = meter[month as keyof WaterMeter]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
  }

  // Categorize meters by level
  const l1Meters = meters.filter(m => m.label === 'L1')
  const l2Meters = meters.filter(m => m.label === 'L2')
  const l3Meters = meters.filter(m => m.label === 'L3')
  const l4Meters = meters.filter(m => m.label === 'L4')
  const dcMeters = meters.filter(m => m.label === 'DC')

  // Calculate totals for each level
  const A1 = l1Meters.reduce((sum, meter) => sum + sumForMonths(meter), 0)
  const A2 = l2Meters.reduce((sum, meter) => sum + sumForMonths(meter), 0)
  const A3_Individual = l3Meters.reduce((sum, meter) => sum + sumForMonths(meter), 0)
  const A4 = l4Meters.reduce((sum, meter) => sum + sumForMonths(meter), 0)

  // Calculate losses
  const Stage1_Loss = A1 - A2
  const Stage2_Loss = A2 - A3_Individual
  const L3_Building_Bulks_Total = l3Meters.filter(m => !m.type?.toLowerCase().includes('end')).reduce((sum, meter) => sum + sumForMonths(meter), 0)
  const L4_Total = l4Meters.reduce((sum, meter) => sum + sumForMonths(meter), 0)
  const Stage3_Loss = L3_Building_Bulks_Total - L4_Total
  const Total_Loss = Stage1_Loss + Stage2_Loss

  // Percentages
  const Stage1_Loss_Percentage = A1 > 0 ? (Stage1_Loss / A1) * 100 : 0
  const Stage2_Loss_Percentage = A2 > 0 ? (Stage2_Loss / A2) * 100 : 0
  const Stage3_Loss_Percentage = L3_Building_Bulks_Total > 0 ? (Stage3_Loss / L3_Building_Bulks_Total) * 100 : 0
  const Total_Loss_Percentage = A1 > 0 ? (Total_Loss / A1) * 100 : 0

  return {
    totalMeters: meters.length,
    l1Count: l1Meters.length,
    l2Count: l2Meters.length,
    l3Count: l3Meters.length,
    l4Count: l4Meters.length,
    dcCount: dcMeters.length,
    A1,
    A2,
    A3_Individual,
    A4,
    Stage1_Loss,
    Stage2_Loss,
    Stage3_Loss,
    Total_Loss,
    Stage1_Loss_Percentage,
    Stage2_Loss_Percentage,
    Stage3_Loss_Percentage,
    Total_Loss_Percentage
  }
}

export const getMonthlyData = (meters: WaterMeter[], months: string[]) => {
  if (!meters || meters.length === 0) {
    return months.map(month => ({ month, total: 0 }))
  }

  return months.map(month => {
    const monthKey = month.toLowerCase().replace('-', '_') as keyof WaterMeter
    const total = meters.reduce((sum, meter) => {
      const value = meter[monthKey]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
    return { month, total }
  })
}

export const getConsumptionByType = (meters: WaterMeter[]) => {
  if (!meters || meters.length === 0) {
    return []
  }

  const types = [...new Set(meters.map(m => m.type).filter(Boolean))]
  return types.map(type => {
    const typeMeters = meters.filter(m => m.type === type)
    const total = typeMeters.reduce((sum, meter) => 
      sum + (meter.jan_25 + meter.feb_25 + meter.mar_25 + meter.apr_25 + meter.may_25 + meter.jun_25 + meter.jul_25), 0
    )
    return { type, total, meters: typeMeters.length }
  })
}

export const getMonthlyBreakdown = (meters: WaterMeter[], groupBy: 'level' | 'type' = 'level') => {
  if (!meters || meters.length === 0) {
    return []
  }

  const months = ['Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25']
  const monthKeys = ['jan_25', 'feb_25', 'mar_25', 'apr_25', 'may_25', 'jun_25', 'jul_25']

  return months.map((month, index) => {
    const monthKey = monthKeys[index] as keyof WaterMeter
    
    if (groupBy === 'level') {
      const l1Total = meters.filter(m => m.label === 'L1').reduce((sum, meter) => sum + (meter[monthKey] as number || 0), 0)
      const l2Total = meters.filter(m => m.label === 'L2').reduce((sum, meter) => sum + (meter[monthKey] as number || 0), 0)
      const l3Total = meters.filter(m => m.label === 'L3').reduce((sum, meter) => sum + (meter[monthKey] as number || 0), 0)
      const l4Total = meters.filter(m => m.label === 'L4').reduce((sum, meter) => sum + (meter[monthKey] as number || 0), 0)
      
      return {
        name: month,
        'L1-Main Source': l1Total,
        'L2-Zone Bulk Meters': l2Total,
        'L3-Building/Villa Meters': l3Total,
        'L4-Individual Meters': l4Total
      }
    } else {
      const types = [...new Set(meters.map(m => m.type).filter(Boolean))]
      const result: any = { name: month }
      
      types.forEach(type => {
        const typeTotal = meters.filter(m => m.type === type).reduce((sum, meter) => sum + (meter[monthKey] as number || 0), 0)
        result[type] = typeTotal
      })
      
      return result
    }
  })
}

export const filterByDateRange = (meters: WaterMeter[], startMonth: number, endMonth: number) => {
  if (!meters || meters.length === 0) {
    return []
  }
  
  return meters // For now, return all meters. Date filtering logic can be added here if needed
}

export const monthLabels = ['Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25']

export type { WaterMeter }