import React, { useState, useEffect, useCallback } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts'
import { Droplets, Calendar, TrendingUp, PieChart as PieIcon, Download, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { fetchWaterMeters, getMonthlyBreakdown, calculateTotalForMonths, filterByDateRange, monthLabels, type WaterMeter } from '../lib/waterData'
import { performComprehensiveValidation, verifyTypeCalculations } from '../lib/dataValidation'
import { DateRangeSlider } from './DateRangeSlider'

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-white/10 p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
)

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: any[], label?: string | number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-[#1A181F]/80 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200 dark:border-white/20">
        <p className="label font-semibold text-gray-800 dark:text-gray-200">{`${label}`}</p>
        {payload.map((pld, index) => (
          <div key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toLocaleString()}`}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const ConsumptionByTypeTab = () => {
  const [waterMeters, setWaterMeters] = useState<WaterMeter[]>([])
  const [selectedType, setSelectedType] = useState('Commercial')
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<any[]>([])
  const [typeTableData, setTypeTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [startMonth, setStartMonth] = useState(0) // Jan-25
  const [endMonth, setEndMonth] = useState(6) // Jul-25
  const [isAnimating, setIsAnimating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<any>(null)
  const [showValidation, setShowValidation] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const meters = await fetchWaterMeters()
        setWaterMeters(meters)
      } catch (error) {
        console.error('Error loading water data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Update data when filters change with double verification
  const updateFilteredData = useCallback(() => {
    if (waterMeters.length === 0) return

    setIsAnimating(true)
    
    setTimeout(() => {
      // FIRST VERIFICATION: Standard data processing
      const breakdown = getMonthlyBreakdown(waterMeters, startMonth, endMonth, { type: selectedType })
      
      // Debug: Log all available types
      const allTypes = [...new Set(waterMeters.map(m => m.type).filter(Boolean))]
      console.log('=== CONSUMPTION BY TYPE DEBUG ===')
      console.log('Available meter types:', allTypes)
      console.log('Looking for type:', selectedType)
      
      // Extra debugging for irrigation specifically
      if (selectedType.toLowerCase() === 'irrigation') {
        console.log('IRRIGATION DEBUGGING:')
        console.log('All types that contain "irrig":', allTypes.filter(type => type.toLowerCase().includes('irrig')))
        console.log('All types that contain "garden":', allTypes.filter(type => type.toLowerCase().includes('garden')))
        console.log('All types that contain "landscape":', allTypes.filter(type => type.toLowerCase().includes('landscape')))
      }
      
      // More flexible type filtering based on actual database types
      const selectedTypeMeters = waterMeters.filter(m => {
        if (!m.type) return false
        
        const meterType = m.type.toLowerCase()
        const searchType = selectedType.toLowerCase()
        
        // Map display types to actual database types
        if (searchType === 'irrigation') {
          return meterType.includes('irr_servies') || 
                 meterType.includes('irrigation') || 
                 meterType.includes('irrigat') || 
                 meterType.includes('garden') ||
                 meterType.includes('landscape')
        }
        
        if (searchType === 'commercial') {
          return meterType.includes('retail') ||
                 meterType.includes('commercial') || 
                 meterType.includes('business') ||
                 meterType.includes('office')
        }
        
        if (searchType === 'residential') {
          return meterType.includes('residential') || 
                 meterType.includes('villa') ||
                 meterType.includes('apart') ||
                 meterType.includes('house') ||
                 meterType.includes('home')
        }
        
        if (searchType === 'common') {
          return meterType.includes('mb_common') ||
                 meterType.includes('d_building_common') ||
                 meterType.includes('common') || 
                 meterType.includes('shared') ||
                 meterType.includes('community')
        }
        
        if (searchType === 'building') {
          return meterType.includes('building') ||
                 meterType.includes('d_building') ||
                 meterType.includes('structure')
        }
        
        if (searchType === 'bulk') {
          return meterType.includes('bulk') ||
                 meterType.includes('main bulk') ||
                 meterType.includes('zone bulk')
        }
        
        // Fallback to partial match
        return meterType.includes(searchType)
      })
      
      console.log(`Found ${selectedTypeMeters.length} meters for type: ${selectedType}`)
      if (selectedTypeMeters.length > 0) {
        console.log('Sample meters:', selectedTypeMeters.slice(0, 3))
        
        // Calculate total consumption to verify data
        const { selectedMonths } = filterByDateRange(waterMeters, startMonth, endMonth)
        const totalConsumption = selectedTypeMeters.reduce((sum, meter) => 
          sum + calculateTotalForMonths(meter, selectedMonths), 0
        )
        console.log(`Total consumption for ${selectedType}:`, totalConsumption)
      } else {
        console.log(`WARNING: No meters found for type ${selectedType}`)
        console.log('Consider checking if the type exists in the database with a different name')
      }
      
      // SECOND VERIFICATION: Comprehensive validation
      const validation = performComprehensiveValidation(
        waterMeters, 
        selectedType, 
        startMonth, 
        endMonth
      )
      
      setValidationStatus(validation)
      
      // Create table data with verified calculations
      const { selectedMonths, monthLabels: labels } = filterByDateRange(waterMeters, startMonth, endMonth)
      
      if (selectedTypeMeters.length > 0) {
        // Use verified data from validation
        const verifiedData = validation.verificationData
        
        // Calculate L1 total for accurate percentage
        const l1Meters = waterMeters.filter(m => m.label === 'L1')
        const l1Total = l1Meters.reduce((sum, meter) => 
          sum + calculateTotalForMonths(meter, selectedMonths), 0
        )
        
        const tableData = [{
          type: selectedType,
          ...verifiedData.monthlyData,
          total: verifiedData.total,
          ofL1: verifiedData.percentageOfL1.toFixed(1),
          meterCount: verifiedData.meterCount,
          isValidated: validation.isValid
        }]
        setTypeTableData(tableData)
      }
      
      setMonthlyBreakdown(breakdown)
      setIsAnimating(false)
      
      // Log validation warnings if any
      if (validation.validationResults.warnings.length > 0) {
        console.warn('Data validation warnings:', validation.validationResults.warnings)
      }
      
      // Log discrepancies if any
      if (validation.discrepancies.length > 0) {
        console.error('Data discrepancies found:', validation.discrepancies)
      }
    }, 200)
  }, [waterMeters, selectedType, startMonth, endMonth])

  useEffect(() => {
    updateFilteredData()
  }, [updateFilteredData])

  // Handle date range change
  const handleDateRangeChange = useCallback((newStartMonth: number, newEndMonth: number) => {
    setStartMonth(newStartMonth)
    setEndMonth(newEndMonth)
  }, [])

  // Calculate KPIs
  const totalConsumption = monthlyBreakdown.reduce((sum, month) => sum + month.consumption, 0)
  const monthlyAverage = monthlyBreakdown.length > 0 ? totalConsumption / monthlyBreakdown.length : 0
  const peakMonth = monthlyBreakdown.reduce((max, month) => 
    month.consumption > max.consumption ? month : max, 
    { month: '', consumption: 0 }
  )
  
  // Calculate percentage of L1 supply dynamically
  const l1Meters = waterMeters.filter(m => m.label === 'L1')
  const l1TotalConsumption = l1Meters.reduce((sum, meter) => {
    const months = ['jan_25', 'feb_25', 'mar_25', 'apr_25', 'may_25', 'jun_25', 'jul_25']
    const monthsInRange = months.slice(startMonth, endMonth + 1)
    return sum + monthsInRange.reduce((mSum, month) => mSum + ((meter as any)[month] || 0), 0)
  }, 0)
  
  const percentageOfL1 = l1TotalConsumption > 0 ? ((totalConsumption / l1TotalConsumption) * 100).toFixed(1) : '0.0'

  const kpis = [
    { 
      icon: Droplets, 
      title: "TOTAL CONSUMPTION", 
      value: `${Math.round(totalConsumption).toLocaleString()} m³`, 
      subtitle: "for selected period", 
      color: "bg-blue-100", 
      iconColor: "text-blue-500" 
    },
    { 
      icon: Calendar, 
      title: "MONTHLY AVERAGE", 
      value: `${Math.round(monthlyAverage).toLocaleString()} m³`, 
      subtitle: `average across ${monthlyBreakdown.length} months`, 
      color: "bg-green-100", 
      iconColor: "text-green-500" 
    },
    { 
      icon: TrendingUp, 
      title: "PEAK MONTH", 
      value: peakMonth.month, 
      subtitle: `${Math.round(peakMonth.consumption).toLocaleString()} m³`, 
      color: "bg-red-100", 
      iconColor: "text-red-500" 
    },
    { 
      icon: PieIcon, 
      title: "% OF L1 SUPPLY", 
      value: `${percentageOfL1}%`, 
      subtitle: `${selectedType} share of total`, 
      color: "bg-teal-100", 
      iconColor: "text-teal-500" 
    },
  ]

  const availableTypes = ['Commercial', 'Residential', 'Irrigation', 'Common', 'Building', 'Bulk']

  if (loading) {
    return <div className="text-center p-8">Loading consumption analysis...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-500">Filter by Usage Type</span>
            {availableTypes.map(type => (
              <button 
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  selectedType === type 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowValidation(!showValidation)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              validationStatus?.isValid 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            {validationStatus?.isValid ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Data Validation
          </button>
        </div>
      </Card>

      {/* Validation Status Panel */}
      {showValidation && validationStatus && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5" />
              Data Validation Report
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              validationStatus.isValid 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {validationStatus.isValid ? 'Verified' : 'Warnings'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white/80 dark:bg-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Total Meters</p>
              <p className="text-xl font-bold text-[#4E4456] dark:text-white">
                {validationStatus.validationResults?.summary?.totalMeters || 0}
              </p>
              <p className="text-xs text-green-600">
                {validationStatus.validationResults?.summary?.validatedMeters || 0} validated
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Total Consumption</p>
              <p className="text-xl font-bold text-[#4E4456] dark:text-white">
                {Math.round(validationStatus.verificationData?.total || 0).toLocaleString()} m³
              </p>
              <p className="text-xs text-blue-600">
                {validationStatus.verificationData?.percentageOfL1?.toFixed(1)}% of L1
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Data Quality</p>
              <p className="text-xl font-bold text-[#4E4456] dark:text-white">
                {validationStatus.discrepancies?.length === 0 ? '100%' : 
                 `${Math.max(0, 100 - validationStatus.discrepancies.length * 10)}%`}
              </p>
              <p className="text-xs text-gray-600">
                {validationStatus.discrepancies?.length || 0} discrepancies
              </p>
            </div>
          </div>
          
          {validationStatus.recommendations?.length > 0 && (
            <div className="mt-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations:</p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {validationStatus.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <DateRangeSlider 
        onRangeChange={handleDateRangeChange}
        defaultStart={startMonth}
        defaultEnd={endMonth}
      />

      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">
              Consumption Analysis: <span className="text-green-500">{selectedType}</span>
            </h3>
            <p className="text-sm text-gray-500">{monthLabels[startMonth]} to {monthLabels[endMonth]}</p>
          </div>
          <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all active:scale-95">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 transition-all duration-500 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          {kpis.map(kpi => (
            <div key={kpi.title} className={`p-4 rounded-lg ${kpi.color} dark:bg-white/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
              <div className="flex items-center gap-4">
                <div className={`${kpi.iconColor.replace('text-','bg-')}/20 p-2 rounded-lg transition-transform duration-200 hover:scale-110`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{kpi.title}</p>
                  <p className="font-bold text-xl text-[#4E4456] dark:text-white transition-all duration-200">{kpi.value}</p>
                  <p className="text-xs text-gray-400">{kpi.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className={`transition-all duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Monthly Trend for {selectedType}</h3>
        <div className={`transition-all duration-300 ${isAnimating ? 'scale-95' : 'scale-100'}`}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyBreakdown} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.1)" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="consumption" 
                stroke="#10B981" 
                fill="url(#colorTrend)"
                animationDuration={800}
                animationBegin={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Consumption by Type</h3>
          {typeTableData[0]?.isValidated && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Data Verified</span>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
              <tr>
                {monthLabels.slice(startMonth, endMonth + 1).map(month => {
                  const monthKey = month.split('-')[0]
                  return <th key={month} className="px-4 py-3">{monthKey}-25 (m³)</th>
                })}
                <th className="px-4 py-3">Total (m³)</th>
                <th className="px-4 py-3">% of L1</th>
                <th className="px-4 py-3">Meters</th>
              </tr>
            </thead>
            <tbody>
              {typeTableData.map(row => (
                <tr key={row.type} className="border-b dark:border-white/10">
                  {monthLabels.slice(startMonth, endMonth + 1).map(month => {
                    const monthKey = month.toLowerCase().replace('-', '')
                    return (
                      <td key={month} className="px-4 py-2">
                        {row[monthKey] ? Math.round(row[monthKey]).toLocaleString() : 'N/A'}
                      </td>
                    )
                  })}
                  <td className="px-4 py-2 font-semibold text-blue-600">
                    {Math.round(row.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-semibold text-green-600">{row.ofL1}%</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs">
                      {row.meterCount} meters
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-right">
          Type: <span className="font-medium">{selectedType}</span> | 
          Period: <span className="font-medium">{monthLabels[startMonth]} to {monthLabels[endMonth]}</span>
        </div>
      </Card>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 ${isAnimating ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}>
        <Card>
          <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Monthly Consumption Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyBreakdown} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.1)" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="consumption" 
                fill="#14B8A6" 
                radius={[4, 4, 0, 0]}
                animationDuration={600}
                animationBegin={100}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={[{ name: selectedType, value: 100 }]} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={80} 
                outerRadius={100} 
                fill="#10B981" 
                labelLine={false}
                animationDuration={800}
                animationBegin={200}
              >
                <Cell fill="#10B981" />
              </Pie>
              <Tooltip />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-[#4E4456] dark:fill-white">
                100%
              </text>
              <text x="50%" y="50%" dy="24" textAnchor="middle" className="fill-gray-500 text-sm">
                {selectedType}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}