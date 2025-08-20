import React, { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts'
import { CheckCircle, RefreshCw } from 'lucide-react'
import { fetchWaterMeters, getZoneData, getMonthlyBreakdown, filterByDateRange, monthLabels, type WaterMeter } from '../lib/waterData'

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

const DonutChart = ({ value, color, title, subtitle }: { value: number, color: string, title: string, subtitle: string }) => (
  <div className="flex flex-col items-center text-center transition-transform duration-300 hover:scale-105">
    <div className="relative w-36 h-36">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={[{ name: 'value', value }]} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            innerRadius="75%" 
            outerRadius="100%" 
            fill={color} 
            startAngle={90} 
            endAngle={90 + (value / 100) * 360} 
            paddingAngle={0}
          >
            <Cell fill={color} />
          </Pie>
          <Pie 
            data={[{ name: 'bg', value: 100 }]} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            innerRadius="75%" 
            outerRadius="100%" 
            fill={`${color}20`} 
            startAngle={0} 
            endAngle={360} 
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-[#4E4456] dark:text-white">{title}</span>
      </div>
    </div>
    <div className="mt-3 text-center">
      <h3 className="font-semibold text-lg text-[#4E4456] dark:text-white">{subtitle}</h3>
    </div>
  </div>
)

export const ZoneAnalysisTab = () => {
  const [waterMeters, setWaterMeters] = useState<WaterMeter[]>([])
  const [selectedMonth, setSelectedMonth] = useState(3) // Apr-25 (index 3)
  const [selectedZone, setSelectedZone] = useState('Zone_08')
  const [zoneData, setZoneData] = useState<any>({})
  const [zones, setZones] = useState<string[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const meters = await fetchWaterMeters()
        const uniqueZones = [...new Set(meters.map(m => m.zone).filter(Boolean))]
        setZones(uniqueZones)
        setWaterMeters(meters)
      } catch (error) {
        console.error('Error loading water data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Update data when filters change
  const updateFilteredData = useCallback(() => {
    if (waterMeters.length === 0) return

    setIsAnimating(true)
    
    setTimeout(() => {
      // Calculate zone data for the selected month (single month range)
      const zoneAnalysis = getZoneData(waterMeters, selectedZone, selectedMonth, selectedMonth)
      setZoneData(zoneAnalysis)
      
      // Create monthly trend data for the selected zone (full year view)
      const trendData = monthLabels.map((month, index) => {
        const bulkData = getMonthlyBreakdown(waterMeters, index, index, { zone: selectedZone, label: 'L2' })
        const individualData = getMonthlyBreakdown(waterMeters, index, index, { zone: selectedZone })
        
        // Subtract bulk from individual to get actual individual consumption
        const bulkTotal = bulkData[0]?.consumption || 0
        const totalZone = individualData[0]?.consumption || 0
        const individualTotal = totalZone - bulkTotal
        const loss = bulkTotal - individualTotal
        
        return {
          month,
          'Zone Bulk': bulkTotal,
          'Individual Total': Math.max(0, individualTotal),
          'Water Loss': Math.max(0, loss)
        }
      })
      
      setMonthlyTrend(trendData)
      setIsAnimating(false)
    }, 200)
  }, [waterMeters, selectedZone, selectedMonth])

  useEffect(() => {
    updateFilteredData()
  }, [updateFilteredData])

  const kpis = [
    { 
      title: "ZONE BULK METER", 
      value: `${Math.round(zoneData.bulkTotal || 0).toLocaleString()} m³`, 
      subValue: selectedZone, 
      color: "text-blue-500" 
    },
    { 
      title: "INDIVIDUAL METERS TOTAL", 
      value: `${Math.round(zoneData.individualTotal || 0).toLocaleString()} m³`, 
      subValue: `${zoneData.individualMeters?.length || 0} meters`, 
      color: "text-green-500" 
    },
    { 
      title: "WATER LOSS/VARIANCE", 
      value: `${Math.round(zoneData.waterLoss || 0).toLocaleString()} m³`, 
      subValue: `${zoneData.lossPercentage?.toFixed(1)}% variance`, 
      color: "text-red-500" 
    },
    { 
      title: "ZONE EFFICIENCY", 
      value: `${zoneData.efficiency?.toFixed(1)}%`, 
      subValue: "Meter coverage", 
      color: "text-yellow-500" 
    },
  ]

  if (loading) {
    return <div className="text-center p-8">Loading zone analysis...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 mr-2">Select Month</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="p-2 border rounded-md dark:bg-white/10 transition-all duration-200"
              >
                {monthLabels.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 mr-2">Filter by Zone</label>
              <select 
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="p-2 border rounded-md dark:bg-white/10 transition-all duration-200"
              >
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={() => { setSelectedMonth(3); setSelectedZone('Zone_08'); }}
            className="text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} /> Reset Filters
          </button>
        </div>
      </Card>

      <Card className={`transition-all duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-2">{selectedZone} Analysis for {monthLabels[selectedMonth]}</h3>
        <p className="text-sm text-gray-500 mb-4">Zone bulk vs individual meters consumption analysis</p>
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 ${isAnimating ? 'scale-95' : 'scale-100'}`}>
          <DonutChart 
            value={100} 
            color="#3B82F6" 
            title={Math.round(zoneData.bulkTotal || 0).toLocaleString()} 
            subtitle="Zone Bulk Meter" 
          />
          <DonutChart 
            value={Math.round(zoneData.efficiency || 0)} 
            color="#10B981" 
            title={Math.round(zoneData.individualTotal || 0).toLocaleString()} 
            subtitle="Individual Meters Total" 
          />
          <DonutChart 
            value={Math.round(zoneData.lossPercentage || 0)} 
            color="#F94144" 
            title={Math.round(zoneData.waterLoss || 0).toLocaleString()} 
            subtitle="Water Loss Distribution" 
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Zone Consumption Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorBulk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.1)" />
            <XAxis dataKey="month" stroke="#9E9AA7" fontSize={12} tickLine={false} axisLine={false}/>
            <YAxis stroke="#9E9AA7" fontSize={12} tickLine={false} axisLine={false}/>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Area 
              type="monotone" 
              dataKey="Zone Bulk" 
              stroke="#3B82F6" 
              fillOpacity={1} 
              fill="url(#colorBulk)" 
              animationDuration={800}
              animationBegin={0}
            />
            <Area 
              type="monotone" 
              dataKey="Individual Total" 
              stroke="#10B981" 
              strokeWidth={2} 
              fill="none" 
              animationDuration={800}
              animationBegin={100}
            />
            <Area 
              type="monotone" 
              dataKey="Water Loss" 
              stroke="#F94144" 
              strokeWidth={2} 
              fill="none" 
              animationDuration={800}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.title} className="flex items-center gap-4">
            <CheckCircle className={`w-8 h-8 ${kpi.color}`} />
            <div>
              <p className="text-sm text-gray-500">{kpi.title}</p>
              <p className="font-bold text-xl text-[#4E4456] dark:text-white">{kpi.value}</p>
              <p className="text-xs text-gray-400">{kpi.subValue}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Individual Meters - {selectedZone}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
              <tr>
                {['Meter Label', 'Account #', 'Type', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Total', 'Status'].map(h => 
                  <th key={h} className="px-4 py-3">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Zone bulk meter row */}
              {zoneData.bulkMeters?.map((meter: WaterMeter) => (
                <tr key={meter.id} className="bg-blue-50 dark:bg-blue-500/10 font-semibold">
                  <td className="px-4 py-2">{meter.meter_label}</td>
                  <td className="px-4 py-2">{meter.account_number}</td>
                  <td className="px-4 py-2">{meter.type}</td>
                  <td className="px-4 py-2">{meter.jan_25?.toLocaleString()}</td>
                  <td className="px-4 py-2">{meter.feb_25?.toLocaleString()}</td>
                  <td className="px-4 py-2">{meter.mar_25?.toLocaleString()}</td>
                  <td className="px-4 py-2">{meter.apr_25?.toLocaleString()}</td>
                  <td className="px-4 py-2">{meter.may_25?.toLocaleString()}</td>
                  <td className="px-4 py-2">{(meter.jan_25 + meter.feb_25 + meter.mar_25 + meter.apr_25 + meter.may_25 + meter.jun_25).toLocaleString()}</td>
                  <td className="px-4 py-2 text-blue-600">L2 - Zone Bulk</td>
                </tr>
              ))}
              
              {/* Individual meters */}
              {zoneData.individualMeters?.slice(0, 10).map((meter: WaterMeter) => {
                const total = meter.jan_25 + meter.feb_25 + meter.mar_25 + meter.apr_25 + meter.may_25 + meter.jun_25
                const status = total > 10 ? 'Normal' : 'No Usage'
                
                return (
                  <tr key={meter.id} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-2 font-medium">{meter.meter_label}</td>
                    <td className="px-4 py-2">{meter.account_number}</td>
                    <td className="px-4 py-2">{meter.type}</td>
                    <td className="px-4 py-2">{meter.jan_25}</td>
                    <td className="px-4 py-2">{meter.feb_25}</td>
                    <td className="px-4 py-2">{meter.mar_25}</td>
                    <td className="px-4 py-2">{meter.apr_25}</td>
                    <td className="px-4 py-2">{meter.may_25}</td>
                    <td className="px-4 py-2 font-semibold">{total}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <p>Showing 1 to {Math.min(10, zoneData.individualMeters?.length || 0)} of {zoneData.individualMeters?.length || 0} meters</p>
          <div>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100 transition-colors">Previous</button>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100 ml-2 transition-colors">Next</button>
          </div>
        </div>
      </Card>
    </div>
  )
}